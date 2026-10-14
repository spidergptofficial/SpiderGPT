import { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

import { supabase } from '../supabase.js';
import { api } from '../api.js';
import { useSession } from '../session.jsx';

export default function Welcome() {
  const { refresh } = useSession();

  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    const exchange = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (
        !active ||
        error ||
        !data.session?.access_token
      ) {
        return;
      }

      try {
        await api('/auth/supabase', {
          method: 'POST',
          body: {
            accessToken: data.session.access_token,
          },
        });

        await refresh();
      } catch (e) {
        if (active) {
          setErr(e.message);
        }
      }
    };

    exchange();

    return () => {
      active = false;
    };
  }, [refresh]);

  const signIn = async () => {
    setErr('');
    setBusy(true);

    const { error } =
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/welcome`,
        },
      });

    if (error) {
      setBusy(false);
      setErr(error.message);
    }
  };

  return (
    <main className="welcome-page">
      {/* Atmospheric background */}
      <div
        className="welcome-atmosphere"
        aria-hidden="true"
      >
        <div className="welcome-glow welcome-glow-one" />
        <div className="welcome-glow welcome-glow-two" />

        <div className="welcome-web web-one" />
        <div className="welcome-web web-two" />

        <span className="welcome-particle particle-one" />
        <span className="welcome-particle particle-two" />
        <span className="welcome-particle particle-three" />
        <span className="welcome-particle particle-four" />
        <span className="welcome-particle particle-five" />
      </div>

      {/* Main content */}
      <section className="welcome-content">
        <div className="welcome-logo-wrap">
          <div className="welcome-logo-glow" />

          <img
            className="welcome-logo"
            src="/brand/logo.png"
            alt="SpiderGPT"
          />
        </div>

        <div className="welcome-copy">
          <div className="welcome-eyebrow">
            <span className="welcome-eyebrow-dot" />
            Your personal AI sidekick
          </div>

          <h1>
            Intelligence that
            <br />
            <span>sticks with you.</span>
          </h1>

          <p>
            Think. Create. Focus. Laugh.
            <br />
            Your Spider is ready for whatever comes next.
          </p>
        </div>

        <div className="welcome-action">
          <button
            className="welcome-google-btn"
            type="button"
            onClick={signIn}
            disabled={busy}
          >
            <span className="welcome-google-icon">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M21.35 12.27c0-.71-.06-1.39-.18-2.05H12v3.88h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.7 2.92-4.2 2.92-7.19Z"
                />
                <path
                  fill="#34A853"
                  d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.51A9.74 9.74 0 0 0 12 21.5Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.54 13.6a5.86 5.86 0 0 1 0-3.75V7.34H3.3a9.5 9.5 0 0 0 0 8.77l3.24-2.51Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.82c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 2.9 14.63 2 12 2a9.74 9.74 0 0 0-8.7 5.34l3.24 2.51C7.31 7.54 9.46 5.82 12 5.82Z"
                />
              </svg>
            </span>

            <span>
              {busy
                ? 'Opening Google…'
                : 'Continue with Google'}
            </span>

            {!busy && (
              <ArrowRight
                className="welcome-google-arrow"
                size={18}
              />
            )}

            {busy && (
              <span
                className="welcome-btn-spinner"
                aria-hidden="true"
              />
            )}
          </button>

          <div className="welcome-trust">
            <ShieldCheck size={14} />
            <span>Private by design · Secure Google sign-in</span>
          </div>
        </div>

        {err && (
          <div
            className="welcome-error err"
            role="alert"
          >
            <span>{err}</span>
          </div>
        )}

        <div className="welcome-features">
          <div>
            <Sparkles size={15} />
            <span>Personalized</span>
          </div>

          <i />

          <div>
            <span>6 personalities</span>
          </div>

          <i />

          <div>
            <span>Always yours</span>
          </div>
        </div>
      </section>

      <footer className="welcome-footer">
        <span>SpiderGPT</span>
        <span>•</span>
        <span>Your AI Sidekick</span>
      </footer>
    </main>
  );
}