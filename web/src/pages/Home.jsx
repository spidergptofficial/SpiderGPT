import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  MessageCircle,
  SlidersHorizontal,
  Clock3,
  Sparkles,
  ChevronRight,
  Zap,
} from 'lucide-react';

import { api } from '../api.js';
import { useSession } from '../session.jsx';
import { useModes } from '../modes.js';
import ModeCard from '../components/ModeCard.jsx';

function formatDate(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();

  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return 'Today';
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (isYesterday) {
    return 'Yesterday';
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year:
      date.getFullYear() === now.getFullYear()
        ? undefined
        : 'numeric',
  });
}

export default function Home() {
  const { me } = useSession();
  const { modes } = useModes();

  const [recent, setRecent] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    let mounted = true;

    setLoadingRecent(true);

    api('/api/conversations?limit=6')
      .then((response) => {
        if (!mounted) return;

        setRecent(
          Array.isArray(response?.items)
            ? response.items
            : [],
        );
      })
      .catch(() => {
        if (mounted) {
          setRecent([]);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingRecent(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const profileName =
    me?.profile?.name ||
    me?.name ||
    'there';

  const spiderName =
    me?.spider?.name ||
    'Your Spider';

  const plan =
    me?.plan ||
    'free';

  const entitlements =
    me?.entitlements || {};

  const usage =
    me?.usage || {};

  const used =
    Number(usage.responses ?? 0);

  const limit =
    entitlements.responses_per_day;

  const isUnlimited =
    limit === null ||
    limit === undefined ||
    Number(limit) < 0;

  const usagePercent =
    isUnlimited || Number(limit) <= 0
      ? 0
      : Math.min(
          100,
          Math.round(
            (used / Number(limit)) * 100,
          ),
        );

  const remaining =
    isUnlimited
      ? null
      : Math.max(
          0,
          Number(limit) - used,
        );

  const usageMessage = useMemo(() => {
    if (isUnlimited) {
      return 'Unlimited responses available';
    }

    if (remaining === 0) {
      return 'Daily response limit reached';
    }

    if (remaining <= 5) {
      return `${remaining} responses remaining today`;
    }

    return `${remaining} responses remaining today`;
  }, [
    isUnlimited,
    remaining,
  ]);

  const visibleModes = Array.isArray(modes)
    ? modes
    : [];

  return (
    <div className="home-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="home-hero">
        <div className="card home-hero-main">

          <div className="home-eyebrow">
            <span className="home-eyebrow-dot" />
            YOUR AI SIDEKICK
          </div>

          <h1 className="home-title">
            Good to see you,
            <br />
            <span>{profileName}.</span>
          </h1>

          <p className="home-subtitle">
            What are we getting done today?
          </p>

          <div className="home-actions">
            <Link
              to="/chat"
              className="btn primary home-primary-action"
            >
              <MessageCircle size={18} />
              Start chatting
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/spider-customize"
              className="btn home-secondary-action"
            >
              <SlidersHorizontal size={18} />
              Customize Spider
            </Link>
          </div>

          <div className="home-hero-note">
            <Sparkles size={15} />
            <span>
              Your Spider is ready when you are.
            </span>
          </div>
        </div>

        <section className="card home-hero-spider">
          <div className="home-spider-glow" />

          <div className="home-spider-frame">
            <img
              src="/brand/icon-app.png"
              alt="SpiderGPT"
            />
          </div>

          <div className="home-spider-label">
            <span>Your Spider</span>
            <strong>{spiderName}</strong>
          </div>
        </section>
      </section>

      {/* =====================================================
          ACCOUNT SUMMARY
      ===================================================== */}

      <section className="home-summary">

        <div className="card home-stat-card usage-card">
          <div className="home-stat-top">
            <div>
              <div className="home-stat-label">
                Today's responses
              </div>

              <div className="home-stat-value">
                {isUnlimited
                  ? '∞'
                  : `${used}/${limit}`}
              </div>
            </div>

            <div className="home-stat-icon">
              <Zap size={18} />
            </div>
          </div>

          {!isUnlimited && (
            <div className="home-progress">
              <div
                className="home-progress-fill"
                style={{
                  width: `${usagePercent}%`,
                }}
              />
            </div>
          )}

          <div className="home-stat-foot">
            {usageMessage}
          </div>
        </div>

        <div className="card home-stat-card">
          <div className="home-stat-top">
            <div>
              <div className="home-stat-label">
                Current plan
              </div>

              <div className="home-stat-value plan-value">
                {String(plan)
                  .charAt(0)
                  .toUpperCase() +
                  String(plan).slice(1)}
              </div>
            </div>
          </div>

          <Link
            to="/pricing"
            className="home-card-link"
          >
            Compare plans
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="card home-stat-card">
          <div className="home-stat-top">
            <div>
              <div className="home-stat-label">
                Your Spider
              </div>

              <div className="home-stat-value spider-value">
                {spiderName}
              </div>
            </div>
          </div>

          <Link
            to="/profile"
            className="home-card-link"
          >
            View profile
            <ArrowRight size={15} />
          </Link>
        </div>

      </section>

      {/* =====================================================
          MODES
      ===================================================== */}

      <section className="home-section">

        <div className="home-section-head">
          <div>
            <div className="eyebrow">
              SIX WAYS TO THINK
            </div>

            <h2>
              Choose your mode.
            </h2>

            <p>
              Give your Spider the right mindset
              for whatever you're doing.
            </p>
          </div>

          <Link
            to="/personality"
            className="btn home-view-all"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        </div>

        {visibleModes.length > 0 ? (
          <div className="home-mode-grid">
            {visibleModes.map((mode) => (
              <ModeCard
                key={mode.id}
                m={mode}
              />
            ))}
          </div>
        ) : (
          <div className="card home-empty-card">
            <Sparkles size={24} />
            <strong>
              Your modes are loading.
            </strong>
            <span className="muted">
              Give us a moment to prepare your Spider.
            </span>
          </div>
        )}

      </section>

      {/* =====================================================
          RECENT CONVERSATIONS
      ===================================================== */}

      <section className="home-section">

        <div className="home-section-head">
          <div>
            <div className="eyebrow">
              RECENT WEB
            </div>

            <h2>
              Recent conversations
            </h2>

            <p>
              Jump back into something you were working on.
            </p>
          </div>

          <Link
            to="/history"
            className="btn home-view-all"
          >
            See history
            <ArrowRight size={16} />
          </Link>
        </div>

        {loadingRecent ? (
          <div className="home-conversation-grid">
            {[1, 2, 3].map((item) => (
              <div
                className="card home-conversation skeleton-card"
                key={item}
              >
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-meta" />
              </div>
            ))}
          </div>
        ) : recent.length > 0 ? (
          <div className="home-conversation-grid">
            {recent.map((conversation) => (
              <Link
                key={conversation.id}
                to={`/chat?c=${conversation.id}`}
                className="card home-conversation"
              >
                <div className="home-conversation-icon">
                  <MessageCircle size={17} />
                </div>

                <div className="home-conversation-content">
                  <strong>
                    {conversation.title ||
                      'Untitled conversation'}
                  </strong>

                  <div className="home-conversation-meta">
                    <span>
                      {conversation.mode || 'brain'}
                    </span>

                    <span className="home-meta-dot">
                      ·
                    </span>

                    <span>
                      {formatDate(
                        conversation.updated_at,
                      )}
                    </span>
                  </div>
                </div>

                <ChevronRight
                  size={18}
                  className="home-conversation-arrow"
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="card home-empty-conversations">
            <div className="home-empty-icon">
              <Clock3 size={25} />
            </div>

            <h3>
              Your web is empty.
            </h3>

            <p className="muted">
              Say hi to {spiderName} and start
              your first conversation.
            </p>

            <Link
              className="btn primary"
              to="/chat"
            >
              <MessageCircle size={17} />
              Open chat
            </Link>
          </div>
        )}

      </section>

    </div>
  );
}