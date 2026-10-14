import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  Image,
  Infinity,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { api } from '../api.js';

function Meter({
  label,
  m,
  unit,
  icon: Icon,
  accent = 'red',
}) {
  const unlimited = m.limit == null;

  const pct = unlimited
    ? 0
    : Math.min(
        100,
        m.limit > 0
          ? (m.used / m.limit) * 100
          : 0
      );

  const remaining = unlimited
    ? null
    : Math.max(0, m.limit - m.used);

  return (
    <article
      className={`usage-meter-card usage-accent-${accent}`}
    >
      <div className="usage-meter-top">
        <div className="usage-meter-icon">
          <Icon size={18} />
        </div>

        <span className="usage-meter-unit">
          {unit}
        </span>
      </div>

      <div className="usage-meter-label">
        {label}
      </div>

      <div className="usage-meter-stat">
        {unlimited ? (
          <Infinity size={34} strokeWidth={2.2} />
        ) : (
          <>
            <strong>{m.used}</strong>
            <span>/ {m.limit}</span>
          </>
        )}
      </div>

      <div className="usage-meter-description">
        {unlimited
          ? `Unlimited ${unit} on your plan.`
          : remaining === 0
            ? `You've used all your ${unit}.`
            : `${remaining} ${unit} remaining.`}
      </div>

      {!unlimited && (
        <div
          className="usage-progress"
          aria-label={`${pct.toFixed(0)}% used`}
        >
          <i
            style={{
              width: `${pct}%`,
            }}
          />
        </div>
      )}

      {!unlimited && (
        <div className="usage-meter-footer">
          <span>{pct.toFixed(0)}% used</span>
          <span>
            {m.used}/{m.limit}
          </span>
        </div>
      )}
    </article>
  );
}

export default function Usage() {
  const [u, setU] = useState();
  const [err, setErr] = useState('');

  useEffect(() => {
    let active = true;

    api('/api/usage')
      .then((data) => {
        if (active) setU(data);
      })
      .catch((e) => {
        if (active) setErr(e.message);
      });

    return () => {
      active = false;
    };
  }, []);

  if (err) {
    return (
      <main className="usage-page">
        <div className="usage-state">
          <div className="usage-state-icon">
            <BarChart3 size={22} />
          </div>

          <h1>Couldn't load usage.</h1>

          <p className="err">{err}</p>
        </div>
      </main>
    );
  }

  if (!u) {
    return (
      <main className="usage-page">
        <div className="usage-loading">
          <span className="usage-spinner" />
          <p>Loading your usage…</p>
        </div>
      </main>
    );
  }

  const hit =
    u.responses.limit != null &&
    u.responses.used >= u.responses.limit;

  const responsePct =
    u.responses.limit == null
      ? 0
      : Math.min(
          100,
          u.responses.limit > 0
            ? (u.responses.used / u.responses.limit) * 100
            : 0
        );

  const resetDate = u.resetsAt
    ? new Date(u.resetsAt)
    : null;

  return (
    <main className="usage-page">
      <div
        className="usage-atmosphere"
        aria-hidden="true"
      >
        <div className="usage-glow usage-glow-one" />
        <div className="usage-glow usage-glow-two" />
      </div>

      <section className="usage-shell">
        <header className="usage-header">
          <div className="usage-heading">
            <div className="usage-heading-icon">
              <BarChart3 size={21} />
            </div>

            <div>
              <div className="eyebrow">
                Your allowance
              </div>

              <h1>
                Usage
                <span>.</span>
              </h1>

              <p>
                Keep an eye on how much of your SpiderGPT allowance
                you've used.
              </p>
            </div>
          </div>

          {resetDate && (
            <div className="usage-reset">
              <CalendarClock size={15} />

              <div>
                <span>Allowance reset</span>
                <strong>
                  {resetDate.toLocaleString()}
                </strong>
              </div>
            </div>
          )}
        </header>

        {hit && (
          <section className="usage-limit-card">
            <div className="usage-limit-icon">
              <Sparkles size={21} />
            </div>

            <div className="usage-limit-content">
              <div className="eyebrow">
                Daily limit reached
              </div>

              <h2>
                Your Spider needs a little
                <span> more room.</span>
              </h2>

              <p>
                You've used all of today's AI responses.
                Upgrade your plan for a larger allowance.
              </p>

              <div className="usage-limit-actions">
                <Link
                  className="usage-primary-btn"
                  to="/pricing"
                >
                  Upgrade your plan
                  <ArrowRight size={17} />
                </Link>

                {resetDate && (
                  <span className="usage-reset-inline">
                    Resets {resetDate.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="usage-overview">
          <div className="usage-overview-label">
            Today's activity
          </div>

          <div className="usage-overview-value">
            {u.responses.limit == null ? (
              <>
                <Infinity size={27} />
                <span>Unlimited responses</span>
              </>
            ) : (
              <>
                <strong>{u.responses.used}</strong>
                <span>
                  of {u.responses.limit} responses used
                </span>
              </>
            )}
          </div>

          {u.responses.limit != null && (
            <div className="usage-overview-progress">
              <i
                style={{
                  width: `${responsePct}%`,
                }}
              />
            </div>
          )}
        </section>

        <section
          className="usage-grid"
          aria-label="Usage allowances"
        >
          <Meter
            label="AI responses today"
            m={u.responses}
            unit="responses"
            icon={Sparkles}
            accent="red"
          />

          <Meter
            label="Image generation today"
            m={u.images}
            unit="images"
            icon={Image}
            accent="purple"
          />

          <Meter
            label="Spider name changes"
            m={u.nameChanges}
            unit="changes"
            icon={UserRound}
            accent="cyan"
          />
        </section>

        <section className="usage-info">
          <div className="usage-info-icon">
            <CalendarClock size={17} />
          </div>

          <div>
            <strong>
              Your allowances refresh automatically.
            </strong>

            <p>
              Daily usage resets according to your account's reset
              schedule. Spider name changes use your monthly allowance.
            </p>
          </div>
        </section>

        <footer className="usage-footer">
          <span>SpiderGPT</span>
          <i />
          <span>Your AI Sidekick</span>
        </footer>
      </section>
    </main>
  );
}