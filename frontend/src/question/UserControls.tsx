import { Bookmark, BookmarkSolid } from 'iconoir-react';

interface UserControlsProps {
  bookmarked: boolean;
  saving: boolean;
  error: string | null;
  onToggleBookmark: () => void;
}

export function UserControls({ bookmarked, saving, error, onToggleBookmark }: UserControlsProps) {
  return (
    <div className="user-controls">
      <button
        className="bookmark-control"
        type="button"
        aria-label={bookmarked ? 'remover questão dos salvos' : 'salvar questão'}
        aria-pressed={bookmarked}
        disabled={saving}
        onClick={onToggleBookmark}
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
