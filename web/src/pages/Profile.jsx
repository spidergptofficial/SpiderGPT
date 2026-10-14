import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  SlidersHorizontal,
  User,
  ShieldCheck,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';

import { api } from '../api.js';
import { useSession } from '../session.jsx';

export default function Profile() {
  const { me } = useSession();

  const [sp, setSp] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api('/api/spider')
      .then(setSp)
      .catch((e) => setErr(e.message));
  }, []);

  const cap = (s) =>
    s ? `${s[0].toUpperCase()}${s.slice(1)}` : '';

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="page-head profile-header">
        <div>
          <div className="eyebrow">My Spider</div>

          <h1>{me.spider.name}</h1>

          <p className="muted">
            {me.profile.name}’s personal AI sidekick.
          </p>
        </div>

        <Link
          className="btn primary"
          to="/spider-customize"
        >
          <SlidersHorizontal size={18} />
          Customize Spider
        </Link>
      </header>

      {/* Error */}
      {err && (
        <div className="profile-error err" role="alert">
          <span>{err}</span>

          <button
            type="button"
            className="btn"
            onClick={() => {
              setErr('');
              api('/api/spider')
                .then(setSp)
                .catch((e) => setErr(e.message));
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Spider overview */}
      <section className="profile-hero card">
        <div className="profile-hero-glow" />

      <div className="profile-spider-icon">
  <img src="/brand/icon-app.png" alt="" aria-hidden="true" />
</div>

        <div className="profile-hero-content">
          <div className="eyebrow">Your sidekick</div>

          <h2>{me.spider.name}</h2>

          <p>
            Your personal Spider is ready to think, create,
            focus, and help you get things done.
          </p>

          <div className="profile-hero-actions">
            <Link
              className="btn primary"
              to="/chat"
            >
              <MessageCircle size={17} />
              Chat with Spider
            </Link>

            <Link
              className="btn"
              to="/spider-customize"
            >
              <SlidersHorizontal size={17} />
              Customize
            </Link>
          </div>
        </div>
      </section>

      {/* Profile information */}
      <section className="profile-grid">
        {/* Personality */}
        <article className="card profile-card">
          <div className="profile-card-icon">
            <Sparkles size={19} />
          </div>

          <div className="profile-card-head">
            <div>
              <div className="eyebrow">How Spider behaves</div>
              <h2>Personality</h2>
            </div>
          </div>

          {!sp ? (
            <div className="profile-loading">
              <span className="profile-spinner" />
              Loading personality…
            </div>
          ) : (
            <>
              <div className="profile-tags">
                {sp.personality?.length ? (
                  sp.personality.map((item) => (
                    <span
                      className="profile-tag"
                      key={item}
                    >
                      {cap(item)}
                    </span>
                  ))
                ) : (
                  <span className="muted">
                    Not set yet.
                  </span>
                )}
              </div>

              <div className="profile-card-detail">
                <span className="profile-detail-label">
                  Talking style
                </span>

                <p>
                  {sp.style?.tones?.length
                    ? `Talks ${sp.style.tones
                        .map(cap)
                        .join(', ')}`
                    : 'Using default talking style.'}
                </p>
              </div>
            </>
          )}
        </article>

        {/* Preferences */}
        <article className="card profile-card">
          <div className="profile-card-icon">
            <SlidersHorizontal size={19} />
          </div>

          <div className="profile-card-head">
            <div>
              <div className="eyebrow">Remembered choices</div>
              <h2>Preferences</h2>
            </div>
          </div>

          {!sp ? (
            <div className="profile-loading">
              <span className="profile-spinner" />
              Loading preferences…
            </div>
          ) : sp.preferences?.length ? (
            <div className="profile-preferences">
              {sp.preferences
                .slice(0, 5)
                .map((preference) => (
                  <div
                    className="profile-preference"
                    key={preference.id}
                  >
                    <span>
                      {cap(preference.kind)}
                    </span>

                    <strong>
                      {preference.value}
                    </strong>
                  </div>
                ))}
            </div>
          ) : (
            <div className="profile-empty-detail">
              <span>Nothing saved yet.</span>

              <Link to="/spider-customize">
                Customize Spider
                <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </article>

        {/* Account */}
        <article className="card profile-card">
          <div className="profile-card-icon">
            <User size={19} />
          </div>

          <div className="profile-card-head">
            <div>
              <div className="eyebrow">Your account</div>
              <h2>Account</h2>
            </div>
          </div>

          <div className="profile-account">
            <div className="profile-account-row">
              <span>Name</span>
              <strong>{me.profile.name}</strong>
            </div>

            <div className="profile-account-row">
              <span>Email</span>
              <strong className="profile-email">
                {me.email}
              </strong>
            </div>

            <div className="profile-account-row">
              <span>Plan</span>

              <strong className="profile-plan">
                {me.plan} plan
              </strong>
            </div>
          </div>

          <div className="profile-account-footer">
            <ShieldCheck size={15} />
            <span>Your account is protected by Google sign-in.</span>
          </div>
        </article>
      </section>
    </div>
  );
}