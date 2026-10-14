import { useState } from 'react';
import { ArrowRight, UserRound, ShieldCheck } from 'lucide-react';

import { api } from '../api.js';
import { useSession } from '../session.jsx';
import Steps from '../components/Steps.jsx';

export default function ProfileSetup() {
  const { refresh } = useSession();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');

    const n = Number(age);

    if (!name.trim()) {
      setErr('Tell us what to call you.');
      return;
    }

    if (!Number.isInteger(n) || n < 13 || n > 120) {
      setErr('SpiderGPT is for people 13 and older.');
      return;
    }

    setBusy(true);

    try {
      await api('/api/profile', {
        method: 'PUT',
        body: {
          name: name.trim(),
          age: n,
        },
      });

      await refresh();
    } catch (e) {
      setErr(e.message);
      setBusy(false);
    }
  }

  return (
    <main className="profile-setup-page">
      <div className="profile-setup-atmosphere" aria-hidden="true">
        <div className="profile-setup-glow profile-setup-glow-one" />
        <div className="profile-setup-glow profile-setup-glow-two" />
        <div className="profile-setup-web" />
      </div>

      <section className="profile-setup-shell">
        <div className="profile-setup-brand">
          <img
            src="/brand/logo.png"
            alt="SpiderGPT"
          />
        </div>

        <div className="profile-setup-card">
          <Steps step={1} />

          <div className="profile-setup-icon">
            <UserRound size={22} strokeWidth={1.8} />
          </div>

          <div className="eyebrow">
            First, a little about you
          </div>

          <h1>
            Let’s meet
            <span> you.</span>
          </h1>

          <p className="profile-setup-subtitle">
            Two quick things, then your Spider.
          </p>

          <form onSubmit={submit} noValidate>
            <div className="profile-setup-fields">
              <div className="field">
                <label htmlFor="name">
                  What should we call you?
                </label>

                <input
                  id="name"
                  className="input profile-setup-input"
                  value={name}
                  maxLength={60}
                  autoComplete="given-name"
                  placeholder="Your name"
                  onChange={(e) => {
                    setName(e.target.value);
                    if (err) setErr('');
                  }}
                  autoFocus
                  disabled={busy}
                />
              </div>

              <div className="field">
                <label htmlFor="age">
                  How old are you?
                </label>

                <input
                  id="age"
                  className="input profile-setup-input"
                  inputMode="numeric"
                  value={age}
                  maxLength={3}
                  placeholder="Your age"
                  onChange={(e) => {
                    setAge(e.target.value.replace(/\D/g, ''));
                    if (err) setErr('');
                  }}
                  disabled={busy}
                />

                <span className="profile-setup-hint">
                  You must be 13 or older to use SpiderGPT.
                </span>
              </div>
            </div>

            {err && (
              <div className="profile-setup-error err" role="alert">
                {err}
              </div>
            )}

            <button
              className="profile-setup-submit"
              type="submit"
              disabled={busy}
            >
              <span>
                {busy ? 'Saving your profile…' : 'Continue'}
              </span>

              {!busy && (
                <ArrowRight size={19} aria-hidden="true" />
              )}

              {busy && (
                <span
                  className="profile-setup-spinner"
                  aria-hidden="true"
                />
              )}
            </button>
          </form>

          <div className="profile-setup-privacy">
            <ShieldCheck size={14} aria-hidden="true" />
            <span>Your information stays private.</span>
          </div>
        </div>

        <div className="profile-setup-footer">
          <span>Step 1 of 2</span>
          <i />
          <span>Then we’ll create your Spider</span>
        </div>
      </section>
    </main>
  );
}