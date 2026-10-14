import { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Clipboard,
  ExternalLink,
  Link2,
  Share2,
  Sparkles,
} from 'lucide-react';
import {
  Link,
  useSearchParams,
} from 'react-router-dom';

import { api } from '../api.js';

export default function Share() {
  const [sp] = useSearchParams();
  const [cid] = useState(sp.get('c'));

  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function load() {
    if (!cid) {
      setErr('Open Share from a conversation.');
      return;
    }

    setErr('');
    setLoading(true);

    try {
      const r = await api(
        `/api/conversations/${cid}/messages`
      );

      const assistant = r.messages
        .filter((m) => m.role === 'assistant')
        .at(-1);

      setData({
        conversation: r.conversation,
        message: assistant,
      });
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function copyResponse() {
    const content = data?.message?.content || '';

    if (!content) return;

    try {
      await navigator.clipboard?.writeText(content);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2200);
    } catch {
      setErr('Could not copy the response.');
    }
  }

  async function shareResponse() {
    const content = data?.message?.content || '';

    if (!content) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: data.conversation?.title || 'SpiderGPT',
          text: content,
        });
      } catch {
        // User cancelled native sharing.
      }

      return;
    }

    await copyResponse();
  }

  if (!data) {
    return (
      <main className="share-page share-empty-page">
        <div
          className="share-atmosphere"
          aria-hidden="true"
        >
          <div className="share-glow share-glow-one" />
          <div className="share-glow share-glow-two" />
          <div className="share-web" />
        </div>

        <section className="share-shell">
          <header className="share-header">
            <Link
              className="share-back-link"
              to={cid ? `/chat?c=${cid}` : '/history'}
            >
              <ArrowLeft size={16} />
              Back
            </Link>

            <img
              src="/brand/logo.png"
              alt="SpiderGPT"
            />
          </header>

          <section className="share-loader-card">
            <div className="share-loader-icon">
              <Share2 size={23} />
            </div>

            <div className="eyebrow">
              Share preview
            </div>

            <h1>
              Share a
              <span> moment.</span>
            </h1>

            <p>
              Create a branded preview without exposing your private
              account details.
            </p>

            {err && (
              <div
                className="share-error"
                role="alert"
              >
                {err}
              </div>
            )}

            <button
              className="share-primary-btn"
              type="button"
              onClick={load}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="share-spinner" />
                  Preparing preview…
                </>
              ) : (
                <>
                  Load preview
                  <ArrowLeft
                    size={17}
                    style={{ transform: 'rotate(180deg)' }}
                  />
                </>
              )}
            </button>

            <Link
              className="share-secondary-btn"
              to={cid ? `/chat?c=${cid}` : '/history'}
            >
              Go back
            </Link>
          </section>
        </section>
      </main>
    );
  }

  const conversation = data.conversation;
  const message = data.message;
  const content = message?.content || '';

  return (
    <main className="share-page">
      <div
        className="share-atmosphere"
        aria-hidden="true"
      >
        <div className="share-glow share-glow-one" />
        <div className="share-glow share-glow-two" />
        <div className="share-web" />
      </div>

      <section className="share-shell">
        <header className="share-header">
          <Link
            className="share-back-link"
            to={`/chat?c=${cid}`}
          >
            <ArrowLeft size={16} />
            Back to chat
          </Link>

          <img
            src="/brand/logo.png"
            alt="SpiderGPT"
          />
        </header>

        <div className="share-heading">
          <div className="share-heading-icon">
            <Share2 size={20} />
          </div>

          <div>
            <div className="eyebrow">
              Share preview
            </div>

            <h1>
              Share a
              <span> moment.</span>
            </h1>

            <p>
              A clean SpiderGPT preview, without your private account
              details.
            </p>
          </div>
        </div>

        <section className="share-preview-card">
          <div className="share-preview-top">
            <div className="share-preview-brand">
              <div className="share-preview-brand-icon">
                <Sparkles size={16} />
              </div>

              <div>
                <strong>SpiderGPT</strong>
                <span>Your AI Sidekick</span>
              </div>
            </div>

            <div className="share-mode-badge">
              {conversation.mode}
            </div>
          </div>

          <div className="share-preview-divider" />

          <div className="share-preview-title">
            {conversation.title || 'Untitled conversation'}
          </div>

          <div className="share-preview-response">
            {content || (
              <span className="share-no-response">
                No assistant response yet.
              </span>
            )}
          </div>

          <div className="share-preview-footer">
            <span>SpiderGPT</span>
            <i />
            <span>Your AI Sidekick</span>
          </div>
        </section>

        <div className="share-privacy-card">
          <div className="share-privacy-icon">
            <Link2 size={17} />
          </div>

          <div>
            <strong>Private by default</strong>

            <p>
              This preview contains the selected response only.
              Your email, account details and private profile information
              are not included.
            </p>
          </div>
        </div>

        {err && (
          <div
            className="share-error share-main-error"
            role="alert"
          >
            {err}
          </div>
        )}

        <div className="share-actions">
          <button
            className="share-primary-btn"
            type="button"
            onClick={copyResponse}
            disabled={!content}
          >
            {copied ? (
              <>
                <Check size={17} />
                Copied
              </>
            ) : (
              <>
                <Clipboard size={17} />
                Copy response
              </>
            )}
          </button>

          <button
            className="share-secondary-btn share-native-btn"
            type="button"
            onClick={shareResponse}
            disabled={!content}
          >
            <ExternalLink size={16} />
            Share
          </button>
        </div>

        <div className="share-bottom-links">
          <Link to={`/chat?c=${cid}`}>
            <ArrowLeft size={14} />
            Back to conversation
          </Link>

          <span />

          <Link to="/history">
            View history
          </Link>
        </div>
      </section>
    </main>
  );
}