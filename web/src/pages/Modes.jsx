import { useModes } from '../modes.js';
import ModeCard from '../components/ModeCard.jsx';

export default function Modes() {
  const { modes, err } = useModes();

  return (
    <div className="modes-page">
      <header className="page-head modes-header">
        <div className="modes-heading">
          <div className="eyebrow">Spider personalities</div>

          <h1>
            Choose your <span>mode.</span>
          </h1>

          <p className="muted">
            Six different vibes. One sidekick. Switch your Spider's
            personality whenever you want.
          </p>
        </div>
      </header>

      {err && (
        <div className="err modes-error" role="alert">
          {err}
        </div>
      )}

      {!modes && !err && (
        <div className="modes-loading">
          <div className="loading-orb" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>

          <p className="muted">Loading Spider modes…</p>
        </div>
      )}

      {modes && (
        <>
          <section
            className="modes-intro"
            aria-label="Spider modes overview"
          >
            <div>
              <strong>Six ways to think.</strong>

              <span>
                Pick the personality that fits what you're doing right now.
              </span>
            </div>

            <div className="modes-count">
              <strong>{modes.length}</strong>
              <span>modes</span>
            </div>
          </section>

          <section
            className="modes-grid"
            aria-label="Available Spider modes"
          >
            {modes.map((mode) => (
              <ModeCard
                key={mode.id}
                m={mode}
                detail
              />
            ))}
          </section>

          <section className="modes-page-footer">
            <div className="eyebrow">
              Your sidekick, your rules
            </div>

            <h2>Switch anytime.</h2>

            <p>
              Changing modes changes how your Spider responds. Your
              conversations stay right where you left them.
            </p>
          </section>
        </>
      )}
    </div>
  );
}