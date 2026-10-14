import { Link } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';
import { setMode } from '../modes.js';

export default function ModeCard({ m, detail = false }) {
  const requiredPlan =
    m.requiredPlan
      ? m.requiredPlan.charAt(0).toUpperCase() + m.requiredPlan.slice(1)
      : 'Plus';

  const cardContent = (
    <>
      {/* Mode glow */}
      <div
        className="mode-card-glow"
        style={{ background: m.color }}
        aria-hidden="true"
      />

      {/* Top status row */}
      <div className="mode-card-top">
        <span
          className="mode-dot"
          style={{
            background: m.color,
            boxShadow: `0 0 18px ${m.color}`,
          }}
          aria-hidden="true"
        />

        <span className="mode-card-label">
          {m.locked ? 'Locked' : 'Available'}
        </span>

        {m.locked ? (
          <Lock size={16} aria-hidden="true" />
        ) : (
          <ArrowRight size={17} aria-hidden="true" />
        )}
      </div>

      {/* Main content */}
      <div className="mode-card-body">
        <h2>
          {m.label}

          {m.locked && (
            <Lock
              size={16}
              className="mode-title-lock"
              aria-hidden="true"
            />
          )}
        </h2>

        <p className="muted">
          {m.desc}
        </p>

        {detail && m.example && (
          <div className="mode-example">
            <span>Example</span>

            <p>
              “{m.example}”
            </p>
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="mode-card-footer">
        <span
          style={
            m.locked
              ? { color: m.color }
              : undefined
          }
        >
          {m.locked
            ? `Available with ${requiredPlan}`
            : `Start with ${m.label}`}
        </span>

        <ArrowRight
          size={15}
          aria-hidden="true"
        />
      </div>
    </>
  );

  /* Locked mode → pricing */
  if (m.locked) {
    return (
      <Link
        to="/pricing"
        className="card mode-card mode-card-locked"
        style={{ '--mode-color': m.color }}
        aria-label={`${m.label} is locked. View ${requiredPlan} plans.`}
      >
        {cardContent}
      </Link>
    );
  }

  /* Available mode → chat */
  return (
    <Link
      to={`/chat?mode=${m.id}`}
      onClick={() => setMode(m.id)}
      className="card mode-card"
      style={{ '--mode-color': m.color }}
      aria-label={`Start ${m.label} mode`}
    >
      {cardContent}
    </Link>
  );
}