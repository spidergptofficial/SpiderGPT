 import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  WandSparkles,
} from 'lucide-react';

import { api } from '../api.js';
import { useSession } from '../session.jsx';
import Steps from '../components/Steps.jsx';
import Group from '../components/Group.jsx';

const TRAITS = [
  'friendly',
  'smart',
  'witty',
  'calm',
  'bold',
  'supportive',
  'playful',
  'serious',
];

const TONES = [
  'friendly',
  'professional',
  'casual',
  'funny',
  'direct',
];

export default function CreateSpider() {
  const { refresh } = useSession();
  const nav = useNavigate();

  const [name, setName] = useState('');
  const [traits, setTraits] = useState([]);
  const [tone, setTone] = useState();
  const [length, setLength] = useState();
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');

    if (!name.trim()) {
      setErr('Every sidekick needs a name.');
      return;
    }

    setBusy(true);

    try {
      await api('/api/spider', {
        method: 'POST',
        body: {
          name: name.trim(),
          personality: traits,
          style: {
            ...(tone ? { tones: [tone] } : {}),
            ...(length ? { length } : {}),
          },
        },
      });

      await refresh();
      nav('/home', { replace: true });
    } catch (e) {
      if (e.code === 'spider_exists') {
        await refresh();
        return nav('/home', { replace: true });
      }

      setErr(e.message);
      setBusy(false);
    }
  }

  return (
    <main className="create-spider-page">
      <div className="create-spider-atmosphere" aria-hidden="true">
        <div className="create-spider-glow create-spider-glow-one" />
        <div className="create-spider-glow create-spider-glow-two" />
        <div className="create-spider-web" />

        <span className="create-spider-particle particle-one" />
        <span className="create-spider-particle particle-two" />
        <span className="create-spider-particle particle-three" />
      </div>

      <section className="create-spider-shell">
        <div className="create-spider-brand">
          <img
            src="/brand/logo.png"
            alt="SpiderGPT"
          />
        </div>

        <form
          className="create-spider-card"
          onSubmit={submit}
        >
          <Steps step={2} />

          <div className="create-spider-icon">
            <WandSparkles size={22} strokeWidth={1.8} />
          </div>

          <div className="eyebrow">
            Make it yours
          </div>

          <h1>
            Create your
            <span> Spider.</span>
          </h1>

          <p className="create-spider-subtitle">
            Give your sidekick a name and a starting personality.
            Everything can be changed later.
          </p>

          <div className="create-spider-section">
            <div className="create-spider-section-heading">
              <div>
                <span className="create-spider-section-number">01</span>
                <span>Identity</span>
              </div>

              <Sparkles size={15} aria-hidden="true" />
            </div>

            <div className="field">
              <label htmlFor="spider-name">
                Spider name
              </label>

              <input
                id="spider-name"
                className="input create-spider-input"
                value={name}
                maxLength={40}
                placeholder="Give your Spider a name"
                onChange={(e) => {
                  setName(e.target.value);
                  if (err) setErr('');
                }}
                autoFocus
                disabled={busy}
              />

              <div className="create-spider-counter">
                {name.length}/40
              </div>
            </div>
          </div>

          <div className="create-spider-section">
            <div className="create-spider-section-heading">
              <div>
                <span className="create-spider-section-number">02</span>
                <span>Personality</span>
              </div>

              <small>{traits.length}/4 selected</small>
            </div>

            <Group
              legend="Choose up to 4 traits"
              options={TRAITS}
              value={traits}
              multi
              max={4}
              onChange={setTraits}
            />
          </div>

          <div className="create-spider-section">
            <div className="create-spider-section-heading">
              <div>
                <span className="create-spider-section-number">03</span>
                <span>Talking style</span>
              </div>
            </div>

            <Group
              legend="How should your Spider talk?"
              options={TONES}
              value={tone}
              onChange={setTone}
            />
          </div>

          <div className="create-spider-section">
            <div className="create-spider-section-heading">
              <div>
                <span className="create-spider-section-number">04</span>
                <span>Response length</span>
              </div>
            </div>

            <Group
              legend="How much should it say?"
              options={['short', 'balanced', 'detailed']}
              value={length}
              onChange={setLength}
            />
          </div>

          {err && (
            <div
              className="create-spider-error err"
              role="alert"
            >
              {err}
            </div>
          )}

          <button
            className="create-spider-submit"
            type="submit"
            disabled={busy}
          >
            <span>
              {busy
                ? 'Spinning your web…'
                : 'Meet your Spider'}
            </span>

            {!busy && (
              <ArrowRight
                size={19}
                aria-hidden="true"
              />
            )}

            {busy && (
              <span
                className="create-spider-spinner"
                aria-hidden="true"
              />
            )}
          </button>

          <p className="create-spider-note">
            You can fine-tune your Spider anytime from customization.
          </p>
        </form>

        <div className="create-spider-footer">
          <span>Step 2 of 2</span>
          <i />
          <span>Your sidekick starts here</span>
        </div>
      </section>
    </main>
  );
}