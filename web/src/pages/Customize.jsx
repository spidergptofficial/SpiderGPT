import { useEffect, useState } from 'react';
import {
  Save,
  RotateCcw,
  UserRound,
  MessageCircle,
  Sparkles,
  SlidersHorizontal,
  Heart,
  Brain,
  ShieldCheck,
  Plus,
  Trash2,
} from 'lucide-react';

import { api } from '../api.js';
import { useSession } from '../session.jsx';
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
  'motivational',
  'calm',
  'sarcastic',
  'concise',
  'detailed',
];

const LV = ['low', 'medium', 'high'];

const BEH = [
  ['ask_first', 'Ask questions before acting'],
  ['direct_answers', 'Give direct answers'],
  ['explain_reasoning', 'Explain reasoning when useful'],
  ['bullets', 'Use bullet points'],
  ['proactive', 'Be proactive'],
];

export default function Customize() {
  const { refresh } = useSession();

  const [s, setS] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pk, setPk] = useState('like');
  const [pv, setPv] = useState('');

  const load = () =>
    api('/api/spider')
      .then((d) =>
        setS({
          ...d,
          personality: d.personality || [],
          style: {
            tones: [],
            length: 'balanced',
            humor: 'medium',
            formality: 'medium',
            directness: 'medium',
            emojis: 'some',
            depth: 'balanced',
            ...(d.style || {}),
          },
          behavior: d.behavior || {},
          preferences: d.preferences || [],
        })
      )
      .catch((e) => setMsg({ bad: true, t: e.message }));

  useEffect(() => {
    load();
  }, []);

  if (!s) {
    return (
      <div className="customize-page">
        {msg ? (
          <div className="err customize-error" role="alert">
            <span>{msg.t}</span>
            <button className="btn" type="button" onClick={load}>
              Retry
            </button>
          </div>
        ) : (
          <div className="customize-loading">
            <div className="customize-loading-orb" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p className="muted">Loading your Spider…</p>
          </div>
        )}
      </div>
    );
  }

  const st = (k, v) =>
    setS((x) => ({
      ...x,
      style: {
        ...x.style,
        [k]: v,
      },
    }));

  const bh = (k, v) =>
    setS((x) => ({
      ...x,
      behavior: {
        ...x.behavior,
        [k]: v,
      },
    }));

  async function save() {
    setBusy(true);
    setMsg(null);

    try {
      await api('/api/spider/customize', {
        method: 'PUT',
        body: {
          name: s.name,
          personality: s.personality,
          style: s.style,
          behavior: s.behavior,
          personalization_enabled: s.personalization_enabled,
          instructions: s.instructions,
        },
      });

      await refresh();

      setMsg({
        t: 'Saved. Your Spider will use this from the next message.',
      });
    } catch (e) {
      setMsg({
        bad: true,
        t: e.message,
      });
    } finally {
      setBusy(false);
    }
  }

  async function addPref(e) {
    e.preventDefault();

    if (!pv.trim()) return;

    try {
      const r = await api('/api/spider/preferences', {
        method: 'POST',
        body: {
          kind: pk,
          value: pv.trim(),
        },
      });

      setS((x) => ({
        ...x,
        preferences: [...(x.preferences || []), r],
      }));

      setPv('');
    } catch (e) {
      setMsg({
        bad: true,
        t: e.message,
      });
    }
  }

  async function delPref(id) {
    try {
      await api(`/api/spider/preferences/${id}`, {
        method: 'DELETE',
      });

      setS((x) => ({
        ...x,
        preferences: x.preferences.filter((p) => p.id !== id),
      }));
    } catch (e) {
      setMsg({
        bad: true,
        t: e.message,
      });
    }
  }

  async function reset() {
    if (!confirm('Reset your Spider personalization? Its name will stay.')) {
      return;
    }

    try {
      await api('/api/spider/personalization', {
        method: 'DELETE',
      });

      await load();
      await refresh();

      setMsg({
        t: 'Personalization reset.',
      });
    } catch (e) {
      setMsg({
        bad: true,
        t: e.message,
      });
    }
  }

  return (
    <div className="customize-page">
      {/* Header */}
      <header className="page-head customize-header">
        <div>
          <div className="eyebrow">Make your Spider yours</div>
          <h1>
            Customize <span>Spider.</span>
          </h1>
          <p className="muted">
            Teach your Spider how you want it to talk, think and remember.
            This is behavior customization — not a photo editor.
          </p>
        </div>

        <button
          className="btn primary customize-save-btn"
          onClick={save}
          disabled={busy}
          type="button"
        >
          <Save size={17} />
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </header>

      {/* Status */}
      {msg && (
        <div
          className={`customize-message ${msg.bad ? 'is-error err' : 'is-success'}`}
          role="status"
        >
          <div className="customize-message-icon">
            {msg.bad ? '!' : '✓'}
          </div>
          <span>{msg.t}</span>
        </div>
      )}

      {/* Identity */}
      <section className="card customize-section">
        <div className="customize-section-head">
          <div className="customize-section-icon">
            <UserRound size={19} />
          </div>

          <div>
            <div className="eyebrow">Your Spider's identity</div>
            <h2>Identity</h2>
          </div>
        </div>

        <p className="muted customize-section-description">
          Your Spider’s name is its identity. Name changes count toward your
          plan’s monthly allowance.
        </p>

        <div className="field">
          <label htmlFor="spider-name">Spider name</label>

          <input
            id="spider-name"
            className="input"
            maxLength={40}
            value={s.name || ''}
            onChange={(e) =>
              setS({
                ...s,
                name: e.target.value,
              })
            }
          />

          <div className="customize-character-count">
            {(s.name || '').length}/40
          </div>
        </div>
      </section>

      {/* Talking style */}
      <section className="card customize-section">
        <div className="customize-section-head">
          <div className="customize-section-icon blue">
            <MessageCircle size={19} />
          </div>

          <div>
            <div className="eyebrow">How Spider communicates</div>
            <h2>Style of talking</h2>
          </div>
        </div>

        <div className="customize-groups">
          <Group
            legend="Talking style — up to 3"
            options={TONES}
            value={s.style.tones || []}
            multi
            max={3}
            onChange={(v) => st('tones', v)}
          />

          <Group
            legend="Response length"
            options={['short', 'balanced', 'detailed']}
            value={s.style.length}
            onChange={(v) => st('length', v)}
          />

          <Group
            legend="Humor"
            options={LV}
            value={s.style.humor}
            onChange={(v) => st('humor', v)}
          />

          <Group
            legend="Formality"
            options={LV}
            value={s.style.formality}
            onChange={(v) => st('formality', v)}
          />

          <Group
            legend="Directness"
            options={LV}
            value={s.style.directness}
            onChange={(v) => st('directness', v)}
          />

          <Group
            legend="Emojis"
            options={['none', 'some', 'lots']}
            value={s.style.emojis}
            onChange={(v) => st('emojis', v)}
          />

          <Group
            legend="Explanation depth"
            options={['simple', 'balanced', 'deep']}
            value={s.style.depth}
            onChange={(v) => st('depth', v)}
          />
        </div>
      </section>

      {/* Personality */}
      <section className="card customize-section">
        <div className="customize-section-head">
          <div className="customize-section-icon purple">
            <Sparkles size={19} />
          </div>

          <div>
            <div className="eyebrow">The personality behind the replies</div>
            <h2>Personality</h2>
          </div>
        </div>

        <p className="muted customize-section-description">
          Pick the traits you want to feel in everyday conversations.
        </p>

        <Group
          legend="Up to 4 traits"
          options={TRAITS}
          value={s.personality}
          multi
          max={4}
          onChange={(v) =>
            setS({
              ...s,
              personality: v,
            })
          }
        />
      </section>

      {/* Response behavior */}
      <section className="card customize-section">
        <div className="customize-section-head">
          <div className="customize-section-icon yellow">
            <SlidersHorizontal size={19} />
          </div>

          <div>
            <div className="eyebrow">Control how Spider responds</div>
            <h2>Response behavior</h2>
          </div>
        </div>

        <div className="customize-toggle-list">
          {BEH.map(([k, l]) => (
            <label className="customize-toggle" key={k}>
              <span className="customize-toggle-copy">
                <strong>{l}</strong>
              </span>

              <input
                type="checkbox"
                checked={!!s.behavior[k]}
                onChange={(e) => bh(k, e.target.checked)}
              />

              <span className="customize-switch" aria-hidden="true">
                <span />
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* Preferences */}
      <section className="card customize-section">
        <div className="customize-section-head">
          <div className="customize-section-icon green">
            <Heart size={19} />
          </div>

          <div>
            <div className="eyebrow">Things Spider should remember</div>
            <h2>Preferences</h2>
          </div>
        </div>

        <p className="muted customize-section-description">
          Useful things your Spider should keep in mind.
        </p>

        <form className="customize-preference-form" onSubmit={addPref}>
          <select
            className="input customize-preference-type"
            value={pk}
            onChange={(e) => setPk(e.target.value)}
          >
            <option value="like">Like</option>
            <option value="dislike">Dislike</option>
            <option value="topic">Topic</option>
            <option value="general">General</option>
          </select>

          <input
            className="input"
            maxLength={200}
            value={pv}
            onChange={(e) => setPv(e.target.value)}
            placeholder="e.g. I prefer concise answers"
          />

          <button
            className="btn primary"
            type="submit"
            disabled={!pv.trim()}
          >
            <Plus size={17} />
            Add
          </button>
        </form>

        {!!s.preferences?.length && (
          <div className="customize-preferences-list">
            {s.preferences.map((p) => (
              <div className="customize-preference-item" key={p.id}>
                <div className="customize-preference-content">
                  <span className="customize-preference-kind">
                    {p.kind}
                  </span>

                  <strong>{p.value}</strong>
                </div>

                <button
                  type="button"
                  className="customize-delete-btn"
                  onClick={() => delPref(p.id)}
                  aria-label={`Remove ${p.kind} preference`}
                  title="Remove preference"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
        )}

        {!s.preferences?.length && (
          <div className="customize-empty-preferences">
            <Heart size={18} />
            <span>No preferences added yet.</span>
          </div>
        )}
      </section>

      {/* Memory & history */}
      <section className="card customize-section">
        <div className="customize-section-head">
          <div className="customize-section-icon cyan">
            <Brain size={19} />
          </div>

          <div>
            <div className="eyebrow">Personalization controls</div>
            <h2>Memory &amp; history</h2>
          </div>
        </div>

        <p className="muted customize-section-description">
          Control whether your saved Spider preferences and custom
          instructions are used in future chats.
        </p>

        <label className="customize-toggle customize-toggle-feature">
          <span className="customize-toggle-copy">
            <strong>Use my Spider personalization</strong>
            <small>
              Let Spider use your saved preferences and custom instructions.
            </small>
          </span>

          <input
            type="checkbox"
            checked={s.personalization_enabled !== false}
            onChange={(e) =>
              setS({
                ...s,
                personalization_enabled: e.target.checked,
              })
            }
          />

          <span className="customize-switch" aria-hidden="true">
            <span />
          </span>
        </label>

        <div className="field customize-instructions-field">
          <label htmlFor="instructions">Custom instructions</label>

          <textarea
            id="instructions"
            rows={6}
            maxLength={2000}
            value={s.instructions || ''}
            onChange={(e) =>
              setS({
                ...s,
                instructions: e.target.value,
              })
            }
            placeholder="Tell your Spider anything else about how you want it to behave…"
          />

          <div className="customize-character-count">
            {(s.instructions || '').length}/2000
          </div>
        </div>

        <div className="customize-reset-area">
          <div>
            <strong>Reset personalization</strong>
            <p className="muted">
              Remove your saved personality, behavior and custom instructions.
              Your Spider's name will stay.
            </p>
          </div>

          <button
            className="btn customize-reset-btn"
            type="button"
            onClick={reset}
          >
            <RotateCcw size={16} />
            Reset personalization
          </button>
        </div>
      </section>

      {/* Bottom save */}
      <div className="customize-bottom-save">
        <div>
          <ShieldCheck size={17} />
          <span>Your changes are saved to your Spider profile.</span>
        </div>

        <button
          className="btn primary"
          onClick={save}
          disabled={busy}
          type="button"
        >
          <Save size={17} />
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}