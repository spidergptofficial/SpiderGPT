import { useEffect, useRef, useState } from 'react';
import {
  Link,
  useSearchParams,
} from 'react-router-dom';

import {
  Send,
  Plus,
  Bookmark,
  Sparkles,
  RotateCcw,
  LockKeyhole,
  X,
} from 'lucide-react';

import { api } from '../api.js';
import { useSession } from '../session.jsx';
import {
  useModes,
  getMode,
  setMode,
} from '../modes.js';

export default function Chat() {
  const {
    me,
    refresh,
  } = useSession();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const {
    modes,
  } = useModes();

  const [
    mode,
    setM,
  ] = useState(
    () =>
      searchParams.get('mode') ||
      getMode(),
  );

  const [
    conversationId,
    setConversationId,
  ] = useState(
    searchParams.get('c'),
  );

  const [
    messages,
    setMessages,
  ] = useState([]);

  const [
    input,
    setInput,
  ] = useState('');

  const [
    busy,
    setBusy,
  ] = useState(false);

  const [
    failure,
    setFailure,
  ] = useState(null);

  const [
    limitReached,
    setLimitReached,
  ] = useState(false);

  const [
    savingId,
    setSavingId,
  ] = useState(null);

  const messagesEndRef =
    useRef(null);

  const textareaRef =
    useRef(null);

  const currentMode =
    modes?.find(
      (item) => item.id === mode,
    );

  /*
   * ---------------------------------------------------------
   * LOAD EXISTING CONVERSATION
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    let mounted = true;

    setFailure(null);

    api(
      `/api/conversations/${conversationId}/messages`,
    )
      .then((response) => {
        if (!mounted) return;

        setMessages(
          Array.isArray(response?.messages)
            ? response.messages
            : [],
        );

        if (response?.conversation?.mode) {
          const conversationMode =
            response.conversation.mode;

          setM(conversationMode);

          setMode(conversationMode);
        }
      })
      .catch((error) => {
        if (!mounted) return;

        setFailure({
          message:
            error?.message ||
            'Unable to load this conversation.',
        });

        setConversationId(null);

        setSearchParams(
          mode
            ? { mode }
            : {},
        );
      });

    return () => {
      mounted = false;
    };
  }, [conversationId]);

  /*
   * ---------------------------------------------------------
   * AUTO SCROLL
   * ---------------------------------------------------------
   */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages, busy]);

  /*
   * ---------------------------------------------------------
   * MODE SELECTION
   * ---------------------------------------------------------
   */

  const pickMode = (nextMode) => {
    setM(nextMode);

    setMode(nextMode);

    setSearchParams(
      conversationId
        ? {
            c: conversationId,
            mode: nextMode,
          }
        : {
            mode: nextMode,
          },
    );

    setFailure(null);
  };

  /*
   * ---------------------------------------------------------
   * NEW CONVERSATION
   * ---------------------------------------------------------
   */

  const newChat = () => {
    setConversationId(null);

    setMessages([]);

    setInput('');

    setFailure(null);

    setLimitReached(false);

    setSearchParams({
      mode,
    });

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  /*
   * ---------------------------------------------------------
   * SEND MESSAGE
   * ---------------------------------------------------------
   */

  async function sendMessage(
    value,
    retry = false,
  ) {
    const text =
      String(value || '').trim();

    if (!text || busy) {
      return;
    }

    setFailure(null);

    setBusy(true);

    /*
     * A retry should NOT duplicate
     * the existing user message.
     */
    if (!retry) {
      setMessages((current) => [
        ...current,
        {
          role: 'user',
          content: text,
        },
      ]);

      setInput('');
    }

    try {
      const response = await api(
        '/api/chat',
        {
          method: 'POST',
          body: {
            conversationId:
              conversationId ||
              undefined,

            mode,

            message: text,
          },
        },
      );

      setConversationId(
        response.conversationId,
      );

      setSearchParams({
        c: response.conversationId,
        mode,
      });

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            response.reply || '',
          id:
            response.assistantMessageId,
          saved: false,
        },
      ]);

      await refresh();
    } catch (error) {
      if (
        error?.code ===
        'quota_exceeded'
      ) {
        setLimitReached(true);
      } else {
        setFailure({
          message:
            error?.message ||
            'Something went wrong while talking to your Spider.',
          text,
        });
      }
    } finally {
      setBusy(false);

      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
  }

  /*
   * ---------------------------------------------------------
   * SAVE MESSAGE
   * ---------------------------------------------------------
   */

  async function saveMessage(message) {
    if (
      !message?.id ||
      message.saved ||
      savingId === message.id
    ) {
      return;
    }

    setSavingId(message.id);

    try {
      await api(
        '/api/saved',
        {
          method: 'POST',
          body: {
            messageId: message.id,
          },
        },
      );

      setMessages((current) =>
        current.map((item) =>
          item.id === message.id
            ? {
                ...item,
                saved: true,
              }
            : item,
        ),
      );
    } catch (error) {
      setFailure({
        message:
          error?.message ||
          'Unable to save this message.',
      });
    } finally {
      setSavingId(null);
    }
  }

  /*
   * ---------------------------------------------------------
   * KEYBOARD
   * ---------------------------------------------------------
   */

  const handleKeyDown = (event) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();

      sendMessage(input);
    }
  };

  /*
   * ---------------------------------------------------------
   * TEXTAREA AUTO GROW
   * ---------------------------------------------------------
   */

  const handleInput = (event) => {
    setInput(event.target.value);

    const element =
      event.currentTarget;

    element.style.height = 'auto';

    element.style.height =
      `${Math.min(
        element.scrollHeight,
        160,
      )}px`;
  };

  /*
   * ---------------------------------------------------------
   * USAGE
   * ---------------------------------------------------------
   */

  const entitlements =
    me?.entitlements || {};

  const usage =
    me?.usage || {};

  const dailyLimit =
    entitlements.responses_per_day;

  const responsesUsed =
    Number(
      usage.responses ?? 0,
    );

  const unlimited =
    dailyLimit == null ||
    Number(dailyLimit) < 0;

  const usageLabel =
    unlimited
      ? '∞ today'
      : `${responsesUsed}/${dailyLimit} today`;

  return (
    <div className="chat-page">

      {/* ===================================================
          CHAT HEADER
          =================================================== */}

      <header className="chat-toolbar">

        <div className="chat-identity">
          <span
            className="chat-status-dot"
            aria-hidden="true"
          />

          <div className="chat-identity-text">
            <strong>
              {me?.spider?.name ||
                'Your Spider'}
            </strong>

            <span>
              {currentMode?.label ||
                mode}
            </span>
          </div>
        </div>

        <div className="chat-toolbar-right">

          <span className="chat-usage">
            {usageLabel}
          </span>

          <button
            type="button"
            className="chat-new-button"
            onClick={newChat}
            aria-label="Start a new conversation"
            title="New conversation"
          >
            <Plus size={19} />
            <span>New chat</span>
          </button>

        </div>
      </header>

      {/* ===================================================
          MODE SELECTOR
          =================================================== */}

      <div
        className="chat-mode-scroll"
        aria-label="Conversation modes"
      >
        <div className="chat-mode-list">

          {modes?.map((item) => {
            const locked =
              Boolean(item.locked);

            const selected =
              item.id === mode;

            if (locked) {
              return (
                <Link
                  key={item.id}
                  to="/pricing"
                  className="chat-mode-chip locked"
                  title={`${item.label} is locked on your current plan`}
                >
                  <span>
                    {item.label}
                  </span>

                  <LockKeyhole
                    size={13}
                  />

                  <span className="sr-only">
                    Locked
                  </span>
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                className={
                  `chat-mode-chip ${
                    selected
                      ? 'selected'
                      : ''
                  }`
                }
                onClick={() =>
                  pickMode(item.id)
                }
                aria-pressed={selected}
              >
                <span>
                  {item.label}
                </span>
              </button>
            );
          })}

        </div>
      </div>

      {/* ===================================================
          MESSAGE AREA
          =================================================== */}

      <div
        className="chat-messages"
        aria-live="polite"
      >

        {/* EMPTY STATE */}

        {!messages.length &&
          !busy && (
            <div className="chat-empty">

              <div className="chat-empty-icon">
                <img
                  src="/brand/icon-app.png"
                  alt=""
                />
              </div>

              <div className="chat-empty-eyebrow">
                <Sparkles size={14} />
                {currentMode?.label ||
                  mode}
              </div>

              <h1>
                What's on your mind?
              </h1>

              <p>
                {currentMode?.example ||
                  `Hey, what should we work on today?`}
              </p>

              <div className="chat-empty-hint">
                Press Enter to send
                <span>·</span>
                Shift + Enter for a new line
              </div>

            </div>
          )}

        {/* MESSAGES */}

        {messages.map(
          (message, index) => {
            const isAssistant =
              message.role ===
              'assistant';

            return (
              <article
                key={
                  message.id ||
                  `${message.role}-${index}`
                }
                className={
                  `chat-message ${
                    message.role
                  }`
                }
              >

                <div className="chat-message-body">
                  {message.content}
                </div>

                {isAssistant &&
                  message.id && (
                    <div className="chat-message-actions">

                      <button
                        type="button"
                        className={
                          `chat-save-button ${
                            message.saved
                              ? 'saved'
                              : ''
                          }`
                        }
                        disabled={
                          message.saved ||
                          savingId ===
                            message.id
                        }
                        onClick={() =>
                          saveMessage(
                            message,
                          )
                        }
                      >
                        <Bookmark
                          size={14}
                          fill={
                            message.saved
                              ? 'currentColor'
                              : 'none'
                          }
                        />

                        <span>
                          {message.saved
                            ? 'Saved'
                            : savingId ===
                              message.id
                            ? 'Saving…'
                            : 'Save'}
                        </span>
                      </button>

                    </div>
                  )}

              </article>
            );
          },
        )}

        {/* THINKING */}

        {busy && (
          <div
            className="chat-message assistant chat-thinking"
            aria-label="Spider is thinking"
          >
            <div className="chat-thinking-inner">

              <span className="thinking-label">
                {me?.spider?.name ||
                  'Spider'} is thinking
              </span>

              <span className="thinking-dots">
                <i />
                <i />
                <i />
              </span>

            </div>
          </div>
        )}

        {/* ERROR */}

        {failure && (
          <div
            className="chat-error"
            role="alert"
          >
            <div className="chat-error-content">
              <strong>
                Something went wrong.
              </strong>

              <span>
                {failure.message}
              </span>
            </div>

            {failure.text && (
              <button
                type="button"
                className="btn"
                onClick={() =>
                  sendMessage(
                    failure.text,
                    true,
                  )
                }
                disabled={busy}
              >
                <RotateCcw size={15} />
                Retry
              </button>
            )}

            <button
              type="button"
              className="chat-error-close"
              onClick={() =>
                setFailure(null)
              }
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div
          ref={messagesEndRef}
          aria-hidden="true"
        />

      </div>

      {/* ===================================================
          COMPOSER
          =================================================== */}

      <div className="chat-composer-wrap">

        <div className="chat-composer">

          <textarea
            ref={textareaRef}
            value={input}
            rows={1}
            maxLength={8000}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={
              `Message ${
                me?.spider?.name ||
                'your Spider'
              }…`
            }
            aria-label="Message your Spider"
            disabled={busy}
          />

          <button
            type="button"
            className="chat-send-button"
            onClick={() =>
              sendMessage(input)
            }
            disabled={
              busy ||
              !input.trim()
            }
            aria-label="Send message"
          >
            <Send size={19} />
          </button>

        </div>

        <div className="chat-composer-footer">
          <span>
            SpiderGPT can make mistakes.
            Check important information.
          </span>

          <span>
            {input.length}/8000
          </span>
        </div>

      </div>

      {/* ===================================================
          QUOTA MODAL
          =================================================== */}

      {limitReached && (
        <div
          className="modal chat-limit-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-limit-title"
        >
          <div className="card chat-limit-card">

            <div className="chat-limit-icon">
              <ZapIcon />
            </div>

            <div>
              <div className="eyebrow">
                DAILY LIMIT
              </div>

              <h2 id="chat-limit-title">
                You've reached today's limit.
              </h2>

              <p className="muted">
                You've used all available
                responses on your{' '}
                {me?.plan || 'current'} plan.
                Your daily allowance resets
                tomorrow.
              </p>
            </div>

            <div className="chat-limit-actions">

              <Link
                className="btn primary"
                to="/pricing"
              >
                Upgrade your web
                <ArrowUpIcon />
              </Link>

              <Link
                className="btn"
                to="/usage"
              >
                View usage
              </Link>

              <button
                type="button"
                className="btn"
                onClick={() =>
                  setLimitReached(false)
                }
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

/*
 * Small inline icons keep the quota dialog
 * independent from another icon package import.
 */

function ZapIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}