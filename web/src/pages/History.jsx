import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trash2,
  MessageCircle,
  Search,
  ArrowRight,
  Clock3,
} from 'lucide-react';

import { api } from '../api.js';
import usePaged from '../components/usePaged.js';

export default function History() {
  const [q, setQ] = useState('');

  const {
    items,
    setItems,
    next,
    loading,
    err,
    more,
    retry,
  } = usePaged('/api/conversations', q ? { q } : {});

  async function del(c) {
    if (!confirm(`Delete “${c.title || 'Untitled conversation'}”?`)) {
      return;
    }

    try {
      await api(`/api/conversations/${c.id}`, {
        method: 'DELETE',
      });

      setItems((current) =>
        current.filter((item) => item.id !== c.id)
      );
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="history-page">
      {/* Header */}
      <header className="page-head history-header">
        <div>
          <div className="eyebrow">Your web</div>

          <h1>History</h1>

          <p className="muted">
            Revisit your conversations and pick up where you left off.
          </p>
        </div>

        <Link className="btn primary" to="/chat">
          <MessageCircle size={18} />
          New chat
        </Link>
      </header>

      {/* Search */}
      <div className="history-search">
        <Search
          size={18}
          aria-hidden="true"
        />

        <input
          className="input"
          type="search"
          placeholder="Search conversations..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search conversations"
        />

        {q && (
          <button
            type="button"
            className="history-search-clear"
            onClick={() => setQ('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Error */}
      {err && (
        <div className="history-error err" role="alert">
          <span>{err}</span>

          <button
            className="btn"
            onClick={retry}
            type="button"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && !items.length && (
        <div className="history-list">
          {[1, 2, 3].map((item) => (
            <div
              className="card history-skeleton"
              key={item}
            >
              <div className="history-skeleton-icon" />

              <div className="history-skeleton-content">
                <div className="history-skeleton-title" />
                <div className="history-skeleton-meta" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !err && !items.length && (
        <div className="card history-empty">
          <div className="history-empty-icon">
            {q ? (
              <Search size={26} />
            ) : (
              <Clock3 size={26} />
            )}
          </div>

          <h2>
            {q
              ? 'Nothing matches that search.'
              : 'No conversations yet.'}
          </h2>

          <p className="muted">
            {q
              ? 'Try a different search term.'
              : 'Your Spider is waiting for your first conversation.'}
          </p>

          {!q && (
            <Link
              className="btn primary"
              to="/chat"
            >
              <MessageCircle size={17} />
              Start your first chat
            </Link>
          )}
        </div>
      )}

      {/* Conversations */}
      {!!items.length && (
        <div className="history-list">
          {items.map((c) => (
            <article
              className="card history-item"
              key={c.id}
            >
              <Link
                to={`/chat?c=${c.id}`}
                className="history-item-link"
                aria-label={`Open ${c.title || 'Untitled conversation'}`}
              >
                <div className="history-item-icon">
                  <MessageCircle
                    size={19}
                    aria-hidden="true"
                  />
                </div>

                <div className="history-item-content">
                  <strong>
                    {c.title || 'Untitled conversation'}
                  </strong>

                  <div className="history-item-meta">
                    <span>
                      {c.mode}
                    </span>

                    <i aria-hidden="true">•</i>

                    <span>
                      {new Date(
                        c.updated_at
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>

                <ArrowRight
                  className="history-item-arrow"
                  size={18}
                  aria-hidden="true"
                />
              </Link>

              <button
                type="button"
                className="history-delete"
                onClick={() => del(c)}
                aria-label={`Delete ${c.title || 'conversation'}`}
              >
                <Trash2 size={18} />
              </button>
            </article>
          ))}
        </div>
      )}

      {/* Loading more */}
      {loading && items.length > 0 && (
        <div className="history-loading-more">
          <span className="history-spinner" />
          Loading more conversations…
        </div>
      )}

      {/* Pagination */}
      {next && !loading && (
        <div className="history-load-more">
          <button
            className="btn"
            onClick={more}
            type="button"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}