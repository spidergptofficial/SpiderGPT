import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Home,
  LoaderCircle,
  ShieldCheck,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { api } from '../api.js';
import { useSession } from '../session.jsx';

export default function PaymentSuccess() {
  const [sp] = useSearchParams();
  const { refresh } = useSession();

  const [status, setStatus] = useState('checking');
  const [err, setErr] = useState('');

  useEffect(() => {
    const provider = sp.get('provider');
    const session = sp.get('session_id');

    let active = true;

    (async () => {
      try {
        if (provider === 'razorpay') {
          await refresh();

          if (active) {
            setStatus('confirmed');
          }

          return;
        }

        if (session) {
          const r = await api(
            `/api/payments/stripe-session?session_id=${encodeURIComponent(session)}`
          );

          if (!active) return;

          if (r.status === 'complete') {
            await refresh();

            if (active) {
              setStatus('confirmed');
            }
          } else {
            setStatus('processing');
          }

          return;
        }

        await refresh();

        if (active) {
          setStatus('processing');
        }
      } catch (e) {
        if (!active) return;

        setErr(e.message);
        setStatus('processing');
      }
    })();

    return () => {
      active = false;
    };
  }, [sp, refresh]);

  return (
    <main className="payment-success-page">
      <div
        className="payment-success-atmosphere"
        aria-hidden="true"
      >
        <div className="payment-success-glow payment-success-glow-one" />
        <div className="payment-success-glow payment-success-glow-two" />
        <div className="payment-success-ring payment-success-ring-one" />
        <div className="payment-success-ring payment-success-ring-two" />
      </div>

      <section className="payment-success-shell">
        <div className="payment-success-brand">
          <img
            src="/brand/logo.png"
            alt="SpiderGPT"
          />
        </div>

        <div className="payment-success-card">
          {status === 'checking' && (
            <>
              <div className="payment-success-status-icon checking">
                <LoaderCircle
                  size={34}
                  className="payment-success-spinner"
                />
              </div>

              <div className="eyebrow">
                Secure verification
              </div>

              <h1>
                Checking your
                <span> payment.</span>
              </h1>

              <p className="payment-success-description">
                We’re verifying the provider response and updating
                your SpiderGPT subscription.
              </p>

              <div className="payment-success-progress">
                <span />
                <span />
                <span />
              </div>

              <div className="payment-success-security">
                <ShieldCheck size={14} />
                <span>
                  Please keep this window open for a moment.
                </span>
              </div>
            </>
          )}

          {status === 'confirmed' && (
            <>
              <div className="payment-success-status-icon confirmed">
                <CheckCircle2 size={38} />
              </div>

              <div className="eyebrow">
                Payment confirmed
              </div>

              <h1>
                Your Spider just got
                <span> stronger.</span>
              </h1>

              <p className="payment-success-description">
                Your subscription is active and your upgraded
                SpiderGPT access is ready to use.
              </p>

              <div className="payment-success-confirmed-box">
                <div className="payment-success-confirmed-icon">
                  <Check size={17} />
                </div>

                <div>
                  <strong>Subscription activated</strong>
                  <span>
                    Your account has been updated successfully.
                  </span>
                </div>
              </div>

              <div className="payment-success-actions">
                <Link
                  className="payment-success-primary"
                  to="/home"
                >
                  <Home size={17} />
                  Go to home
                  <ArrowRight size={17} />
                </Link>

                <Link
                  className="payment-success-secondary"
                  to="/billing"
                >
                  View billing
                </Link>
              </div>

              <div className="payment-success-security">
                <ShieldCheck size={14} />
                <span>
                  Your subscription is securely linked to your account.
                </span>
              </div>
            </>
          )}

          {status === 'processing' && (
            <>
              <div className="payment-success-status-icon processing">
                <Clock3 size={34} />
              </div>

              <div className="eyebrow">
                Payment received
              </div>

              <h1>
                Your payment is
                <span> processing.</span>
              </h1>

              <p className="payment-success-description">
                Your payment provider is still confirming the
                subscription. This can take a little moment while
                provider webhooks are processed.
              </p>

              {err && (
                <div
                  className="payment-success-error"
                  role="alert"
                >
                  {err}
                </div>
              )}

              <div className="payment-success-processing-note">
                <Clock3 size={16} />

                <span>
                  You don't need to pay again. Check billing shortly
                  to see the latest subscription status.
                </span>
              </div>

              <div className="payment-success-actions">
                <Link
                  className="payment-success-primary"
                  to="/billing"
                >
                  Check billing
                  <ArrowRight size={17} />
                </Link>

                <Link
                  className="payment-success-secondary"
                  to="/home"
                >
                  Back home
                </Link>
              </div>

              <div className="payment-success-security">
                <ShieldCheck size={14} />
                <span>
                  Your subscription will activate after confirmation.
                </span>
              </div>
            </>
          )}
        </div>

        <footer className="payment-success-footer">
          <span>SpiderGPT</span>
          <i />
          <span>Your AI Sidekick</span>
        </footer>
      </section>
    </main>
  );
}