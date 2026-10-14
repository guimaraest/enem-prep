import { Link } from 'react-router';

import type { QuestionId } from '../models';

interface QuestionNavProps {
    previousId?: QuestionId;
    nextId?: QuestionId;
    loading?: boolean;
    error?: boolean;
}
export function QuestionNav({ previousId, nextId, loading = false, error = false }: QuestionNavProps) {

    return (
        <nav className="question-nav" aria-label="navegação entre questões">
            {previousId ? (
                <Link className="question-nav-link link hover" to={`/perguntas/${previousId}`}>
                    previous
                </Link>
            ) : (
                <span className="question-nav-link link hover question-nav-disabled" aria-disabled="true">
                    previous
                </span>
            )}
            {nextId ? (
                <Link className="question-nav-link link hover" to={`/perguntas/${nextId}`}>
                    next
                </Link>
            ) : (
                <span className="question-nav-link link hover question-nav-disabled" aria-disabled="true">
                    next
                </span>
            )}
            {loading && <span className="question-nav-status">loading</span>}
            {error && (
                <span className="question-nav-status" role="status">
                    não foi possível carregar a navegação.
                </span>
            )}
        </nav>
    );
}
