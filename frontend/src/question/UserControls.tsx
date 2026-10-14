import { Bookmark, BookmarkSolid } from 'iconoir-react';
import { useEffect, useState } from 'react';

import { api } from '../api';
import type { QuestionId } from '../models';

interface UserControlsProps {
  questionId: QuestionId;
}

export function UserControls({ questionId }: UserControlsProps) {
  const [bookmarked, setBookmarked] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setBookmarked(null);
    setError(null);

    api.userQuestions.getById(questionId)
      .then((data) => {
        if (!cancelled) setBookmarked(data.isBookmarked);
      })
      .catch((cause: unknown) => {
        console.error('failed to load question user data:', cause);
        if (!cancelled) {
          setError('erro');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [questionId]);

  async function toggleBookmark() {
    if (bookmarked === null || saving) return;

    const next = !bookmarked;
    setSaving(true);
    setError(null);

    try {
      await api.userQuestions.setBookmarked(questionId, next);
      setBookmarked(next);
    } catch (cause) {
      console.error('failed to update question bookmark:', cause);
      setError('erro');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="user-controls">
      <button
        className="bookmark-control"
        type="button"
        aria-label={bookmarked ? 'remover questão dos salvos' : 'salvar questão'}
        aria-pressed={bookmarked === true}
        disabled={bookmarked === null || saving}
        onClick={() => void toggleBookmark()}
      >
        {bookmarked
          ? <BookmarkSolid aria-hidden="true" />
          : <Bookmark aria-hidden="true" />}
      </button>

      {error && (
        <span className="user-controls-error" role="status">
          {error}
        </span>
      )}
    </div>
  );
}