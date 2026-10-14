import { useState } from 'react';
import { Check, Palette, Sparkles } from 'lucide-react';

import { api } from '../api.js';
import { useSession } from '../session.jsx';

const THEMES = [
  {
    id: 'dark',
    name: 'Spider Dark',
    description: 'Pure cinematic black.',
    colors: ['#080808', '#111111', '#1b1b1b'],
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Cooler, blue-tinted darks.',
    colors: ['#06080d', '#0e1118', '#171b25'],
  },
  {
    id: 'ember',
    name: 'Ember',
    description: 'Warmer, ember-tinted darks.',
    colors: ['#0a0706', '#140e0c', '#1f1512'],
  },
];

export default function Themes() {
  const { me, refresh } = useSession();
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState('');

  const activeTheme = me?.profile?.theme || 'dark';

  async function pick(theme) {
    if (theme === activeTheme || saving) return;

    setSaving(theme);
    setErr('');

    try {
      await api('/api/profile/theme', {
        method: 'PATCH',
        body: { theme },
      });

      document.documentElement.dataset.theme = theme;
      localStorage.setItem('sg_theme', theme);

      await refresh();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving('');
    }
  }

  return (
    <div className="themes-page">
      <header className="page-head themes-header">
        <div>
          <div className="eyebrow">Appearance</div>

          <h1>
            Choose your <span>mood.</span>
          </h1>

          <p className="muted">
            Change the atmosphere of SpiderGPT. Your Spider’s red stays.
          </p>
        </div>
      </header>

      {err && (
        <div className="themes-error err" role="alert">
          <span>{err}</span>

          <button
            type="button"
            className="btn"
            onClick={() => setErr('')}
          >
            Dismiss
          </button>
        </div>
      )}

      <section className="themes-intro">
        <div className="themes-intro-icon">
          <Palette size={19} />
        </div>

        <div>
          <strong>Pick your atmosphere.</strong>
          <span>
            Every theme keeps the SpiderGPT identity while changing the
            surrounding darkness.
          </span>
        </div>
      </section>

      <section
        className="themes-grid"
        aria-label="Available SpiderGPT themes"
      >
        {THEMES.map((theme) => {
          const selected = activeTheme === theme.id;
          const loading = saving === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              className={`card theme-card ${selected ? 'selected' : ''}`}
              aria-pressed={selected}
              onClick={() => pick(theme.id)}
              disabled={!!saving}
              style={{
                '--theme-one': theme.colors[0],
                '--theme-two': theme.colors[1],
                '--theme-three': theme.colors[2],
              }}
            >
              <div className="theme-preview">
                <div className="theme-preview-bar">
                  <span />
                  <span />
                  <span />
                </div>

                <div className="theme-preview-body">
                  <div className="theme-preview-sidebar">
                    <i />
                    <i />
                    <i />
                  </div>

                  <div className="theme-preview-content">
                    <div className="theme-preview-line large" />
                    <div className="theme-preview-line" />
                    <div className="theme-preview-card" />
                  </div>
                </div>

                <div
                  className="theme-preview-accent"
                  aria-hidden="true"
                />
              </div>

              <div className="theme-card-content">
                <div className="theme-card-heading">
                  <div>
                    <h2>{theme.name}</h2>
                    <p>{theme.description}</p>
                  </div>

                  <span
                    className={`theme-check ${selected ? 'visible' : ''}`}
                    aria-hidden="true"
                  >
                    {loading ? (
                      <span className="theme-spinner" />
                    ) : (
                      <Check size={16} />
                    )}
                  </span>
                </div>

                <div className="theme-swatches" aria-hidden="true">
                  {theme.colors.map((color) => (
                    <i
                      key={color}
                      style={{ background: color }}
                    />
                  ))}

                  <i className="theme-accent-swatch" />
                </div>

                <div className="theme-card-footer">
                  <span>
                    {selected ? 'Currently active' : 'Use this theme'}
                  </span>

                  {selected && <Sparkles size={14} />}
                </div>
              </div>
            </button>
          );
        })}
      </section>

      <section className="themes-footer">
        <div className="themes-footer-icon">
          <Sparkles size={18} />
        </div>

        <div>
          <strong>Your Spider stays the same.</strong>
          <p className="muted">
            Themes change the interface around your Spider — your personality,
            conversations and preferences remain untouched.
          </p>
        </div>
      </section>
    </div>
  );
}