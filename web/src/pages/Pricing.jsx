import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Crown,
  Zap,
  Sparkles,
  ArrowRight,
  Globe2,
  ShieldCheck,
} from 'lucide-react';

import { api } from '../api.js';

const cap = (s) =>
  s ? `${s[0].toUpperCase()}${s.slice(1)}` : '';

const money = (minor, cur) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: cur,
    maximumFractionDigits: minor % 100 ? 2 : 0,
  }).format(minor / 100);

const PLAN_META = {
  free: {
    icon: Sparkles,
    eyebrow: 'Start with Spider',
    description: 'A solid everyday AI sidekick.',
  },
  pro: {
    icon: Zap,
    eyebrow: 'Most popular',
    description: 'More freedom for everyday work and creativity.',
  },
  plus: {
    icon: Crown,
    eyebrow: 'Full access',
    description: 'The complete SpiderGPT experience.',
  },
};

export default function Pricing() {
  const [d, setD] = useState();
  const [err, setErr] = useState('');
  const [cur, setCur] = useState(
    (navigator.language || '').toLowerCase().includes('in')
      ? 'INR'
      : 'USD'
  );
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    api('/api/plans')
      .then(setD)
      .catch((e) => setErr(e.message));
  }, []);

  if (err) {
    return (
      <div className="pricing-page">
        <div className="pricing-error err" role="alert">
          <span>{err}</span>

          <button
            type="button"
            className="btn"
            onClick={() => {
              setErr('');

              api('/api/plans')
                .then(setD)
                .catch((e) => setErr(e.message));
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!d) {
    return (
      <div className="pricing-page">
        <div className="pricing-loading">
          <div className="pricing-loading-orb" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <p className="muted">Loading plans…</p>
        </div>
      </div>
    );
  }

  const currencies = [
    ...new Set(
      d.plans.flatMap((p) =>
        Object.keys(p.prices || {})
      )
    ),
  ];

  const periods = [
    ...new Set(
      d.plans.flatMap((p) =>
        Object.values(p.prices || {}).flatMap(Object.keys)
      )
    ),
  ];

  const c = currencies.includes(cur)
    ? cur
    : currencies[0];

  const per = periods.includes(period)
    ? period
    : periods[0];

  return (
    <div className="pricing-page">
      {/* Header */}
      <header className="page-head pricing-header">
        <div>
          <div className="eyebrow">Plans</div>

          <h1>
            Choose your <span>Spider.</span>
          </h1>

          <p className="muted">
            More room. More modes. More Spider.
          </p>
        </div>
      </header>

      {/* Controls */}
      <div className="pricing-controls">
        <div className="pricing-control-group">
          <Globe2 size={15} />

          <span className="pricing-control-label">
            Currency
          </span>

          <div className="pricing-chips">
            {currencies.map((x) => (
              <button
                type="button"
                className={`chip ${x === c ? 'selected' : ''}`}
                key={x}
                onClick={() => setCur(x)}
                aria-pressed={x === c}
              >
                {x}
              </button>
            ))}
          </div>
        </div>

        {periods.length > 1 && (
          <div className="pricing-control-group">
            <span className="pricing-control-label">
              Billing
            </span>

            <div className="pricing-chips">
              {periods.map((x) => (
                <button
                  type="button"
                  className={`chip ${x === per ? 'selected' : ''}`}
                  key={x}
                  onClick={() => setPeriod(x)}
                  aria-pressed={x === per}
                >
                  {cap(x)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Plans */}
      <section
        className="pricing-grid"
        aria-label="SpiderGPT plans"
      >
        {d.plans.map((p) => {
          const e = p.entitlements || {};
          const amt = p.prices?.[c]?.[per];
          const current = p.code === d.current;
          const free = p.code === 'free';

          const meta =
            PLAN_META[p.code] || PLAN_META.free;

          const Icon = meta.icon;

          return (
            <article
              className={`card pricing-plan ${
                p.code
              } ${current ? 'current' : ''}`}
              key={p.code}
            >
              {/* Popular/current badge */}
              {current && (
                <div className="pricing-plan-badge current-badge">
                  <Check size={13} />
                  Current plan
                </div>
              )}

              {!current && p.code === 'pro' && (
                <div className="pricing-plan-badge popular-badge">
                  <Zap size={13} />
                  Most popular
                </div>
              )}

              <div className="pricing-plan-top">
                <div className="pricing-plan-icon">
                  <Icon size={20} />
                </div>

                <div>
                  <div className="eyebrow">
                    {current
                      ? 'Your plan'
                      : meta.eyebrow}
                  </div>

                  <h2>{p.name}</h2>

                  <p>{meta.description}</p>
                </div>
              </div>

              {/* Price */}
              <div className="pricing-price">
                {free ? (
                  <strong>Free</strong>
                ) : amt != null ? (
                  <>
                    <strong>{money(amt, c)}</strong>

                    <span>
                      / {per === 'yearly'
                        ? 'year'
                        : 'month'}
                    </span>
                  </>
                ) : (
                  <strong>—</strong>
                )}
              </div>

              {!free && amt != null && per === 'yearly' && (
                <div className="pricing-billing-note">
                  Billed yearly
                </div>
              )}

              {/* Features */}
              <div className="pricing-features">
                <div className="pricing-feature">
                  <Check size={16} />

                  <span>
                    {e.responses_per_day == null
                      ? 'Unlimited'
                      : e.responses_per_day}{' '}
                    AI responses per day
                  </span>
                </div>

                <div className="pricing-feature">
                  <Check size={16} />

                  <span>
                    {e.modes?.length ?? 0} of 6 modes
                  </span>
                </div>

                {e.modes?.length > 0 && (
                  <div className="pricing-feature-detail">
                    {e.modes.map(cap).join(' · ')}
                  </div>
                )}

                <div className="pricing-feature">
                  <Check size={16} />

                  <span>
                    {e.name_changes_per_month == null
                      ? 'Unlimited'
                      : e.name_changes_per_month}{' '}
                    Spider name changes/month
                  </span>
                </div>

                <div className="pricing-feature">
                  <Check size={16} />

                  <span>
                    {e.images_per_day == null
                      ? 'Unlimited'
                      : e.images_per_day}{' '}
                    image generations/day
                  </span>
                </div>

                <div className="pricing-feature">
                  <Check size={16} />

                  <span>
                    {e.custom_appearance_allowed
                      ? 'Expanded Spider customization'
                      : 'Core Spider customization'}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="pricing-plan-action">
                {current ? (
                  <span className="btn pricing-current-btn">
                    <Check size={16} />
                    Current plan
                  </span>
                ) : free ? (
                  <span className="pricing-included">
                    Included for everyone
                  </span>
                ) : amt != null ? (
                  <Link
                    className="btn primary pricing-choose-btn"
                    to={`/checkout?plan=${p.code}&period=${per}&currency=${c}`}
                  >
                    Choose {p.name}
                    <ArrowRight size={17} />
                  </Link>
                ) : (
                  <span className="pricing-unavailable">
                    Not available in this currency yet.
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </section>

      {/* Trust footer */}
      <section className="pricing-trust">
        <ShieldCheck size={18} />

        <div>
          <strong>Your plan, your Spider.</strong>

          <p>
            Upgrade when you need more access. Your conversations and
            Spider personalization stay with your account.
          </p>
        </div>
      </section>
    </div>
  );
}