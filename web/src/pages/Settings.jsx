import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  UserRound,
  SlidersHorizontal,
  Palette,
  CreditCard,
  ShieldCheck,
  LogOut,
  Trash2,
  AlertTriangle,
  Lock,
  Save,
  RotateCcw,
} from 'lucide-react';

import { api } from '../api.js';
import { useSession } from '../session.jsx';

const Row = ({ to, icon: Icon, title, description }) => (
  <Link to={to} className="settings-linkrow">
    <span className="settings-linkrow-icon">
      <Icon size={18} />
    </span>

    <span className="settings-linkrow-content">
      <strong>{title}</strong>
      <small>{description}</small>
    </span>

    <ChevronRight className="settings-linkrow-arrow" size={19} />
  </Link>
);

export default function Settings() {
  const { me, refresh, logout } = useSession();

  const [name, setName] = useState(me.profile.name);
  const [age, setAge] = useState(String(me.profile.age));
  const [msg, setMsg] = useState(null);
  const [del, setDel] = useState(false);
  const [typed, setTyped] = useState('');
  const [saving, setSaving] = useState(false);

  async function save(e) {
    e.preventDefault();

    const n = Number(age);

    if (
      !name.trim() ||
      !Number.isInteger(n) ||
      n < 13 ||
      n > 120
    ) {
      setMsg({
        bad: true,
        t: 'Please enter a valid name and age.',
      });
      return;
    }

    setSaving(true);
    setMsg(null);

    try {
      await api('/api/profile', {
        method: 'PUT',
        body: {
          name: name.trim(),
          age: n,
        },
      });

      await refresh();

      setMsg({
        t: 'Profile saved.',
      });
    } catch (e) {
      setMsg({
        bad: true,
        t: e.message,
      });
    } finally {
      setSaving(false);
    }
  }

  async function wipe(path, question, success) {
    if (!confirm(question)) return;

    setMsg(null);

    try {
      await api(path, {
        method: 'DELETE',
      });

      setMsg({
        t: success,
      });

      await refresh();
    } catch (e) {
      setMsg({
        bad: true,
        t: e.message,
      });
    }
  }

  async function remove(e) {
    e.preventDefault();

    if (typed !== 'DELETE') return;

    try {
      await api('/api/account', {
        method: 'DELETE',
        body: {
          confirm: 'DELETE',
        },
      });

      await logout();
    } catch (e) {
      setMsg({
        bad: true,
        t: e.message,
      });
    }
  }

  return (
    <div className="settings-page">
      {/* Header */}
      <header className="page-head settings-header">
        <div>
          <div className="eyebrow">Control room</div>

          <h1>
            Settings<span>.</span>
          </h1>

          <p className="muted">
            Manage your account, Spider preferences, privacy and subscription.
          </p>
        </div>
      </header>

      {/* Status */}
      {msg && (
        <div
          className={`settings-message ${msg.bad ? 'is-error err' : 'is-success'}`}
          role="status"
        >
          <span className="settings-message-icon">
            {msg.bad ? '!' : '✓'}
          </span>

          <span>{msg.t}</span>
        </div>
      )}

      {/* Account */}
      <section className="card settings-section">
        <div className="settings-section-head">
          <div className="settings-section-icon">
            <UserRound size={19} />
          </div>

          <div>
            <div className="eyebrow">Your personal details</div>
            <h2>Account</h2>
          </div>
        </div>

        <div className="settings-account-email">
          <ShieldCheck size={16} />
          <span>
            Signed in with Google as <strong>{me.email}</strong>
          </span>
        </div>

        <form onSubmit={save} className="settings-profile-form">
          <div className="settings-profile-fields">
            <div className="field">
              <label htmlFor="sname">Name</label>

              <input
                id="sname"
                className="input"
                maxLength={60}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="field">
              <label htmlFor="sage">Age</label>

              <input
                id="sage"
                className="input"
                inputMode="numeric"
                value={age}
                onChange={(e) =>
                  setAge(e.target.value.replace(/\D/g, ''))
                }
                autoComplete="off"
              />
            </div>
          </div>

          <button
            className="btn primary"
            type="submit"
            disabled={saving}
          >
            <Save size={17} />
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      </section>

      {/* Preferences */}
      <section className="card settings-section">
        <div className="settings-section-head">
          <div className="settings-section-icon purple">
            <SlidersHorizontal size={19} />
          </div>

          <div>
            <div className="eyebrow">Make SpiderGPT yours</div>
            <h2>Preferences</h2>
          </div>
        </div>

        <div className="settings-links">
          <Row
            to="/spider-customize"
            icon={SlidersHorizontal}
            title="Customize Spider"
            description="Personality, talking style, behavior and memory"
          />

          <Row
            to="/themes"
            icon={Palette}
            title="Appearance & themes"
            description="Choose the visual mood of SpiderGPT"
          />

          <Row
            to="/pricing"
            icon={CreditCard}
            title="Plans"
            description="Compare Free, Pro and Plus"
          />

          <Row
            to="/billing"
            icon={CreditCard}
            title="Subscription & billing"
            description="Manage your current subscription"
          />
        </div>
      </section>

      {/* Privacy */}
      <section className="card settings-section">
        <div className="settings-section-head">
          <div className="settings-section-icon green">
            <Lock size={19} />
          </div>

          <div>
            <div className="eyebrow">Your data</div>
            <h2>Privacy</h2>
          </div>
        </div>

        <div className="settings-privacy">
          <ShieldCheck size={20} />

          <div>
            <strong>Your account is private.</strong>

            <p>
              Your conversations and Spider personalization are private to
              your account. When you send a message, its content is processed
              by the AI provider configured for SpiderGPT.
            </p>

            <p>
              You can delete your personalization, conversations or entire
              account from the controls below.
            </p>
          </div>
        </div>
      </section>

      {/* Logout */}
      <section className="card settings-section">
        <div className="settings-action-row">
          <div className="settings-action-copy">
            <div className="settings-action-icon">
              <LogOut size={18} />
            </div>

            <div>
              <strong>Log out</strong>
              <p className="muted">
                Sign out of this SpiderGPT account on this device.
              </p>
            </div>
          </div>

          <button
            className="btn"
            type="button"
            onClick={logout}
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </section>

      {/* Danger zone */}
      <section className="card settings-section settings-danger">
        <div className="settings-section-head">
          <div className="settings-section-icon danger">
            <AlertTriangle size={19} />
          </div>

          <div>
            <div className="eyebrow">Be careful</div>
            <h2>Danger zone</h2>
          </div>
        </div>

        <div className="settings-danger-list">
          {/* Clear personalization */}
          <div className="settings-danger-item">
            <div>
              <strong>Clear personalization</strong>
              <p>
                Remove your saved Spider personalization while keeping your
                account and conversations.
              </p>
            </div>

            <button
              className="btn"
              type="button"
              onClick={() =>
                wipe(
                  '/api/spider/personalization',
                  'Reset all Spider personalization?',
                  'Personalization cleared.'
                )
              }
            >
              <RotateCcw size={16} />
              Clear
            </button>
          </div>

          {/* Delete conversations */}
          <div className="settings-danger-item">
            <div>
              <strong>Delete all conversations</strong>
              <p>
                Permanently remove your conversation history. This cannot be
                undone.
              </p>
            </div>

            <button
              className="btn"
              type="button"
              onClick={() =>
                wipe(
                  '/api/conversations',
                  'Delete all conversations? This cannot be undone.',
                  'Conversations deleted.'
                )
              }
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>

          {/* Delete account */}
          <div className="settings-danger-item account-delete">
            <div>
              <strong>Delete account</strong>
              <p>
                Permanently erase your SpiderGPT account and its associated
                data.
              </p>
            </div>

            {!del ? (
              <button
                className="btn settings-delete-account-btn"
                type="button"
                onClick={() => setDel(true)}
              >
                <Trash2 size={16} />
                Delete account
              </button>
            ) : (
              <form
                className="settings-delete-form"
                onSubmit={remove}
              >
                <label htmlFor="confirm-delete">
                  Type <strong>DELETE</strong> to permanently erase your
                  account data.
                </label>

                <input
                  id="confirm-delete"
                  className="input"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck="false"
                />

                <div className="settings-delete-actions">
                  <button
                    className="btn primary settings-confirm-delete"
                    disabled={typed !== 'DELETE'}
                    type="submit"
                  >
                    <Trash2 size={16} />
                    Delete my account
                  </button>

                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setDel(false);
                      setTyped('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}