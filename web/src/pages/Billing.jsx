import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  CalendarDays,
  Receipt,
  AlertTriangle,
  ArrowRight,
  XCircle,
  RefreshCw,
} from 'lucide-react';

import { api } from '../api.js';

const cap = (s) =>
  s ? `${s[0].toUpperCase()}${s.slice(1)}` : '';

const money = (amount, currency) =>
  amount
    ? new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
      }).format(amount / 100)
    : '—';

export default function Billing() {
  const [d, setD] = useState();
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () =>
    api('/api/billing')
      .then(setD)
      .catch((e) => setErr(e.message));

  useEffect(() => {
    load();
  }, []);

  async function cancel() {
    if (
      !confirm(
        'Schedule this subscription to cancel at the end of the current period?'
      )
    ) {
      return;
    }

    setBusy(true);
    setErr('');

    try {
      await api('/api/billing/cancel', {
        method: 'POST',
        body: {
          atPeriodEnd: true,
        },
      });

      await load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (err && !d) {
    return (
      <div className="billing-page">
        <div className="billing-error err" role="alert">
          <span>{err}</span>

          <button
            type="button"
            className="btn"
            onClick={() => {
              setErr('');
              load();
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
      <div className="billing-page">
        <div className="billing-loading">
          <div className="billing-loading-orb" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <p className="muted">Loading billing…</p>
        </div>
      </div>
    );
  }

  const subscription = d.subscription;
  const payments = d.payments || [];
  const status = subscription?.status;

  return (
    <div className="billing-page">
      {/* Header */}
      <header className="page-head billing-header">
        <div>
          <div className="eyebrow">Subscription</div>

          <h1>
            Billing<span>.</span>
          </h1>

          <p className="muted">
            Manage your SpiderGPT plan and payment history.
          </p>
        </div>

        <Link className="btn" to="/pricing">
          View plans
          <ArrowRight size={16} />
        </Link>
      </header>

      {err && (
        <div className="billing-inline-error err" role="alert">
          <span>{err}</span>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setErr('');
              load();
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Current plan */}
      <section className="card billing-plan-card">
        <div className="billing-plan-top">
          <div className="billing-plan-icon">
            <CreditCard size={21} />
          </div>

          <div className="billing-plan-heading">
            <div className="eyebrow">Current plan</div>

            <h2>
              {cap(d.currentPlan)} plan
            </h2>
          </div>

          {subscription && (
            <span
              className={`billing-status ${
                status === 'active'
                  ? 'active'
                  : 'attention'
              }`}
            >
              <span />
              {cap(status)}
            </span>
          )}
        </div>

        {subscription ? (
          <>
            <div className="billing-details">
              <div className="billing-detail">
                <div className="billing-detail-icon">
                  <ShieldCheck size={17} />
                </div>

                <div>
                  <span>Status</span>
                  <strong
                    className={
                      status === 'active'
                        ? 'billing-status-text-active'
                        : 'billing-status-text-attention'
                    }
                  >
                    {cap(status)}
                  </strong>
                </div>
              </div>

              {subscription.current_period_end && (
                <div className="billing-detail">
                  <div className="billing-detail-icon">
                    <CalendarDays size={17} />
                  </div>

                  <div>
                    <span>Current period ends</span>
                    <strong>
                      {new Date(
                        subscription.current_period_end
                      ).toLocaleString()}
                    </strong>
                  </div>
                </div>
              )}
            </div>

            {subscription.cancel_at_period_end && (
              <div className="billing-cancellation">
                <AlertTriangle size={18} />

                <div>
                  <strong>
                    Cancellation is scheduled
                  </strong>

                  <p>
                    Your subscription will end at the end of
                    the current billing period.
                  </p>
                </div>
              </div>
            )}

            {!subscription.cancel_at_period_end && (
              <div className="billing-plan-actions">
                <button
                  className="btn"
                  type="button"
                  onClick={cancel}
                  disabled={busy}
                >
                  <XCircle size={16} />
                  {busy
                    ? 'Updating…'
                    : 'Cancel at period end'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="billing-free-state">
            <div>
              <strong>You are on the Free plan.</strong>
              <p className="muted">
                Upgrade whenever you want more modes, more
                messages and more Spider customization.
              </p>
            </div>

            <Link className="btn primary" to="/pricing">
              Explore plans
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </section>

      {/* Payment history */}
      <section className="card billing-history-card">
        <div className="billing-section-head">
          <div className="billing-section-icon">
            <Receipt size={19} />
          </div>

          <div>
            <div className="eyebrow">Your transactions</div>
            <h2>Payment history</h2>
          </div>
        </div>

        {payments.length ? (
          <div className="billing-payments">
            {payments.map((p, i) => (
              <article
                className="billing-payment"
                key={`${p.provider_payment_id}-${i}`}
              >
                <div className="billing-payment-icon">
                  <CreditCard size={17} />
                </div>

                <div className="billing-payment-main">
                  <div className="billing-payment-title">
                    <strong>
                      {p.plan_code
                        ? cap(p.plan_code)
                        : p.provider}
                    </strong>

                    <span
                      className={`billing-payment-status ${
                        p.status === 'paid' ||
                        p.status === 'succeeded' ||
                        p.status === 'success'
                          ? 'success'
                          : ''
                      }`}
                    >
                      {cap(p.status)}
                    </span>
                  </div>

                  <div className="billing-payment-meta">
                    {new Date(
                      p.created_at
                    ).toLocaleString()}
                  </div>
                </div>

                <div className="billing-payment-amount">
                  {money(p.amount, p.currency)}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="billing-empty">
            <div className="billing-empty-icon">
              <Receipt size={23} />
            </div>

            <h3>No payments yet.</h3>

            <p className="muted">
              Your payment history will appear here after
              your first subscription payment.
            </p>

            <Link className="btn" to="/pricing">
              View plans
            </Link>
          </div>
        )}
      </section>

      {/* Security footer */}
      <section className="billing-security">
        <ShieldCheck size={18} />

        <div>
          <strong>Your billing information is protected.</strong>
          <p>
            Subscription and payment information is handled
            through the payment provider configured for
            SpiderGPT.
          </p>
        </div>

        <button
          type="button"
          className="billing-refresh"
          onClick={() => {
            setErr('');
            load();
          }}
          aria-label="Refresh billing information"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </section>
    </div>
  );
}