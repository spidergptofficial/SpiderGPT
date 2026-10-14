import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import { api } from '../api.js';
import { useSession } from '../session.jsx';

const money = (minor, cur) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: cur,
  }).format(minor / 100);

export default function Checkout() {
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const { refresh } = useSession();

  const [plans, setPlans] = useState();
  const [provider, setProvider] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const plan = sp.get('plan');
  const period = sp.get('period') || 'monthly';
  const currency = sp.get('currency') || 'INR';

  useEffect(() => {
    let active = true;

    Promise.all([
      api('/api/plans'),
      api('/api/payments/providers'),
    ])
      .then(([p, pr]) => {
        if (!active) return;

        setPlans(p);

        setProvider(
          pr.razorpay
            ? 'razorpay'
            : pr.stripe
              ? 'stripe'
              : ''
        );
      })
      .catch((e) => {
        if (active) setErr(e.message);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!plan) {
    return (
      <main className="checkout-page checkout-state-page">
        <div className="checkout-state-card">
          <div className="checkout-state-icon">
            <Sparkles size={22} />
          </div>

          <div className="eyebrow">Secure checkout</div>

          <h1>No plan selected.</h1>

          <p className="muted">
            Choose a SpiderGPT plan first, then come back here to complete
            your upgrade.
          </p>

          <Link className="checkout-back-btn" to="/pricing">
            <ArrowLeft size={17} />
            Back to plans
          </Link>
        </div>
      </main>
    );
  }

  if (err && !plans) {
    return (
      <main className="checkout-page checkout-state-page">
        <div className="checkout-state-card">
          <div className="checkout-state-icon checkout-state-error">
            !
          </div>

          <div className="eyebrow">Checkout unavailable</div>

          <h1>Something went wrong.</h1>

          <p className="checkout-error-text">
            {err}
          </p>

          <Link className="checkout-back-btn" to="/pricing">
            <ArrowLeft size={17} />
            Back to plans
          </Link>
        </div>
      </main>
    );
  }

  if (!plans) {
    return (
      <main className="checkout-page checkout-state-page">
        <div className="checkout-loading">
          <span className="checkout-spinner" />
          <p>Preparing your secure checkout…</p>
        </div>
      </main>
    );
  }

  const p = plans.plans.find((x) => x.code === plan);
  const amount = p?.prices?.[currency]?.[period];

  async function pay() {
    setBusy(true);
    setErr('');

    try {
      const r = await api('/api/payments/checkout', {
        method: 'POST',
        body: {
          plan_code: plan,
          billing_period: period,
          currency,
          provider,
        },
      });

      if (r.provider === 'stripe') {
        location.href = r.checkoutUrl;
        return;
      }

      if (r.provider === 'razorpay') {
        if (r.shortUrl) {
          location.href = r.shortUrl;
          return;
        }

        await loadRazorpay(r);
      }
    } catch (e) {
      setErr(e.message);
      setBusy(false);
    }
  }

  async function loadRazorpay(r) {
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    const openCheckout = () => {
      const opts = {
        key: r.keyId,
        subscription_id: r.subscriptionId,
        name: 'SpiderGPT',
        description: `${p.name} — ${period}`,

        handler: async (response) => {
          try {
            await api('/api/payments/verify', {
              method: 'POST',
              body: {
                provider: 'razorpay',
                ...response,
                subscription_id: r.subscriptionId,
                plan_code: plan,
                billing_period: period,
              },
            });

            await refresh();

            nav(
              '/payment-success?provider=razorpay',
              { replace: true }
            );
          } catch (e) {
            setErr(e.message);
          } finally {
            setBusy(false);
          }
        },

        modal: {
          ondismiss: () => {
            setBusy(false);
          },
        },

        theme: {
          color: '#FF3B30',
        },
      };

      if (!window.Razorpay) {
        setErr('Could not initialize Razorpay Checkout.');
        setBusy(false);
        return;
      }

      new window.Razorpay(opts).open();
    };

    if (existing) {
      if (window.Razorpay) {
        openCheckout();
        return;
      }

      existing.addEventListener('load', openCheckout, {
        once: true,
      });

      existing.addEventListener(
        'error',
        () => {
          setErr('Could not load Razorpay Checkout.');
          setBusy(false);
        },
        { once: true }
      );

      return;
    }

    const script = document.createElement('script');

    script.src =
      'https://checkout.razorpay.com/v1/checkout.js';

    script.async = true;

    script.onload = openCheckout;

    script.onerror = () => {
      setErr('Could not load Razorpay Checkout.');
      setBusy(false);
    };

    document.body.appendChild(script);
  }

  if (!p) {
    return (
      <main className="checkout-page checkout-state-page">
        <div className="checkout-state-card">
          <div className="checkout-state-icon checkout-state-error">
            !
          </div>

          <div className="eyebrow">Checkout</div>

          <h1>Plan not found.</h1>

          <p className="muted">
            This plan is no longer available. Please return to the plans
            page and choose another one.
          </p>

          <Link className="checkout-back-btn" to="/pricing">
            <ArrowLeft size={17} />
            View plans
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-atmosphere" aria-hidden="true">
        <div className="checkout-glow checkout-glow-one" />
        <div className="checkout-glow checkout-glow-two" />
      </div>

      <section className="checkout-shell">
        <header className="checkout-header">
          <Link
            className="checkout-back-link"
            to="/pricing"
          >
            <ArrowLeft size={16} />
            Back to plans
          </Link>

          <div className="checkout-brand">
            <img
              src="/brand/logo.png"
              alt="SpiderGPT"
            />
          </div>
        </header>

        <div className="checkout-layout">
          <section className="checkout-main">
            <div className="checkout-heading">
              <div className="checkout-heading-icon">
                <LockKeyhole size={20} />
              </div>

              <div>
                <div className="eyebrow">
                  Secure checkout
                </div>

                <h1>
                  Upgrade to <span>{p.name}</span>
                </h1>

                <p>
                  Give your Spider more room to think, create and help.
                </p>
              </div>
            </div>

            <div className="checkout-plan-card">
              <div className="checkout-plan-top">
                <div>
                  <span className="checkout-plan-label">
                    Selected plan
                  </span>

                  <h2>{p.name}</h2>
                </div>

                <div className="checkout-plan-badge">
                  {period === 'yearly'
                    ? 'Yearly'
                    : 'Monthly'}
                </div>
              </div>

              <div className="checkout-price">
                <strong>
                  {amount != null
                    ? money(amount, currency)
                    : '—'}
                </strong>

                <span>
                  / {period === 'yearly'
                    ? 'year'
                    : 'month'}
                </span>
              </div>

              <div className="checkout-plan-meta">
                <span>
                  {period === 'yearly'
                    ? 'Billed yearly'
                    : 'Billed monthly'}
                </span>

                <i />

                <span>{currency}</span>
              </div>
            </div>

            <div className="checkout-security-card">
              <div className="checkout-security-icon">
                <ShieldCheck size={19} />
              </div>

              <div>
                <strong>Secure payment</strong>

                <p>
                  Payments are processed by the selected payment provider.
                  SpiderGPT only activates your subscription after successful
                  backend verification and provider confirmation.
                </p>
              </div>
            </div>

            {provider && (
              <div className="checkout-provider">
                <span>Payment provider</span>

                <strong>
                  {provider === 'razorpay'
                    ? 'Razorpay'
                    : 'Stripe'}
                </strong>
              </div>
            )}

            {!provider && (
              <div className="checkout-inline-error">
                No payment provider is configured yet.
              </div>
            )}

            {err && (
              <div
                className="checkout-inline-error"
                role="alert"
              >
                {err}
              </div>
            )}
          </section>

          <aside className="checkout-summary">
            <div className="checkout-summary-label">
              Order summary
            </div>

            <div className="checkout-summary-plan">
              <div className="checkout-summary-icon">
                <Sparkles size={18} />
              </div>

              <div>
                <strong>{p.name}</strong>
                <span>
                  {period === 'yearly'
                    ? 'Annual subscription'
                    : 'Monthly subscription'}
                </span>
              </div>
            </div>

            <div className="checkout-summary-divider" />

            <div className="checkout-summary-row">
              <span>Plan</span>
              <strong>{p.name}</strong>
            </div>

            <div className="checkout-summary-row">
              <span>Billing</span>
              <strong>
                {period === 'yearly'
                  ? 'Yearly'
                  : 'Monthly'}
              </strong>
            </div>

            <div className="checkout-summary-row">
              <span>Currency</span>
              <strong>{currency}</strong>
            </div>

            <div className="checkout-summary-divider" />

            <div className="checkout-total">
              <span>Total</span>

              <strong>
                {amount != null
                  ? money(amount, currency)
                  : '—'}
              </strong>
            </div>

            <button
              className="checkout-pay-btn"
              type="button"
              onClick={pay}
              disabled={
                busy ||
                !provider ||
                amount == null
              }
            >
              {busy ? (
                <>
                  <span className="checkout-btn-spinner" />
                  Opening secure checkout…
                </>
              ) : (
                <>
                  Continue to secure checkout
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="checkout-trust">
              <LockKeyhole size={13} />
              <span>Secure payment connection</span>
            </div>

            <Link
              className="checkout-summary-back"
              to="/pricing"
            >
              Change plan
            </Link>
          </aside>
        </div>

        <footer className="checkout-footer">
          <ShieldCheck size={14} />
          <span>
            Your subscription is verified securely before access is activated.
          </span>
        </footer>
      </section>
    </main>
  );
}