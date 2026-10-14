import { useState } from 'react';
import { Star, Trash2, Search, ArrowRight, Bookmark } from 'lucide-react';

import { api } from '../api.js';
import usePaged from '../components/usePaged.js';

export default function Saved() {
  const [q, setQ] = useState('');
  const [fav, setFav] = useState(false);

  const {
    items,
    setItems,
    next,
    loading,
    err,
    more,
    retry,
  } = usePaged('/api/saved', {
    ...(q ? { q } : {}),
    ...(fav ? { favorite: '1' } : {}),
  });

  async function star(s) {
    try {
      await api(`/api/saved/${s.id}`, {
        method: 'PATCH',
        body: {
          favorite: !s.favorite,
        },
      });

      setItems((current) =>
        current.map((item) =>
          item.id === s.id
            ? {
                ...item,
                favorite: !item.favorite,
              }
            : item
        )
      );
    } catch (e) {
      alert(e.message);
    }
  }

  async function del(s) {
    if (!confirm('Delete this saved response?')) {
      return;
    }

    try {
      await api(`/api/saved/${s.id}`, {
        method: 'DELETE',
      });

      setItems((current) =>
        current.filter((item) => item.id !== s.id)
      );
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="saved-page">
      <header className="page-head saved-header">
        <div>
          <div className="eyebrow">Keep the good stuff</div>

          <h1>Saved</h1>

          <p className="muted">
            Keep your favorite Spider responses close by.
          </p>
        </div>
      </header>

      <div className="saved-toolbar">
        <div className="saved-search">
          <Search size={18} aria-hidden="true" />

          <input
            className="input"
            type="search"
            placeholder="Search saved responses..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search saved responses"
          />

          {q && (
            <button
              type="button"
              className="saved-search-clear"
              onClick={() => setQ('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <button
          type="button"
          className={`chip saved-filter ${fav ? 'selected' : ''}`}
          onClick={() => setFav((current) => !current)}
          aria-pressed={fav}
        >
          <Star
            size={15}
            fill={fav ? 'currentColor' : 'none'}
            aria-hidden="true"
          />
          Favorites
        </button>
      </div>

      {err && (
        <div className="saved-error err" role="alert">
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

      {loading && !items.length && (
        <div className="saved-list">
          {[1, 2, 3].map((item) => (
            <div className="card saved-skeleton" key={item}>
              <div className="saved-skeleton-content">
                <div className="saved-skeleton-line large" />
                <div className="saved-skeleton-line medium" />
                <div className="saved-skeleton-line small" />
              </div>

              <div className="saved-skeleton-actions">
                <div />
                <div />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !err && !items.length && (
        <div className="card saved-empty">
          <div className="saved-empty-icon">
            {q || fav ? (
              <Search size={26} />
            ) : (
              <Bookmark size={26} />
            )}
          </div>

          <h2>
            {q || fav
              ? 'Nothing matches your filters.'
              : 'Nothing saved yet.'}
          </h2>

          <p className="muted">
            {q || fav
              ? 'Try a different search or turn off the Favorites filter.'
              : 'Save a response from chat to keep it here.'}
          </p>

          {(q || fav) && (
            <button
              type="button"
              className="btn"
              onClick={() => {
                setQ('');
                setFav(false);
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {!!items.length && (
        <div className="saved-list">
          {items.map((s) => (
            <article className="card saved-item" key={s.id}>
              <div className="saved-item-main">
                <div className="saved-item-top">
                  <div className="saved-item-badge">
                    <Bookmark
                      size={15}
                      aria-hidden="true"
                    />
                    Saved response
                  </div>

                  {s.favorite && (
                    <span className="saved-favorite-label">
                      <Star
                        size={14}
                        fill="currentColor"
                        aria-hidden="true"
                      />
                      Favorite
                    </span>
                  )}
                </div>

                <p className="saved-content">
                  {s.content}
                </p>
              </div>

              <div className="saved-item-actions">
                <button
                  type="button"
                  className={`saved-action ${
                    s.favorite ? 'is-favorite' : ''
                  }`}
                  onClick={() => star(s)}
                  aria-label={
                    s.favorite
                      ? 'Remove from favorites'
                      : 'Add to favorites'
                  }
                  aria-pressed={s.favorite}
                  title={
                    s.favorite
                      ? 'Remove from favorites'
                      : 'Add to favorites'
                  }
                >
                  <Star
                    size={18}
                    fill={
                      s.favorite
                        ? 'currentColor'
                        : 'none'
                    }
                  />
                </button>

                <button
                  type="button"
                  className="saved-action delete"
                  onClick={() => del(s)}
                  aria-label="Delete saved response"
                  title="Delete saved response"
                >
                  <Trash2 size={18} />
                </button>

                <ArrowRight
                  className="saved-arrow"
                  size={17}
                  aria-hidden="true"
                />
              </div>
            </article>
          ))}
        </div>
      )}

      {loading && items.length > 0 && (
        <div className="saved-loading-more">
          <span className="saved-spinner" />
          Loading more saved responses…
        </div>
      )}

      {next && !loading && (
        <div className="saved-load-more">
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