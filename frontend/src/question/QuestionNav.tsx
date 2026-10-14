import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { api } from '../api';
import type { QuestionId } from '../models';

interface QuestionNavProps {
    questionId: QuestionId;
}


interface QuestionNavState {
    questionId: QuestionId;
    previousId?: QuestionId;
    nextId?: QuestionId;
    error: boolean;
}

export function QuestionNav({ questionId }: QuestionNavProps) {
    const [state, setState] = useState<QuestionNavState>({
        questionId,
        error: false,
    });
    const isCurrentQuestion = state.questionId === questionId;
    const previousId = isCurrentQuestion ? state.previousId : undefined;
    const nextId = isCurrentQuestion ? state.nextId : undefined;
    const loading = !isCurrentQuestion;
    const error = isCurrentQuestion && state.error;

    useEffect(() => {
        let cancelled = false;

        Promise.all([
            api.previousQuestion(),
            api.nextQuestion(),
        ])
            .then(([previous, next]) => {
                if (!cancelled) {
                    setState({
                        questionId,
                        previousId: previous,
                        nextId: next,
                        error: false,
                    });
                }
            })
            .catch((cause: unknown) => {
                console.error('failed to load question navigation:', cause);
                if (!cancelled) {
                    setState({
                        questionId,
                        error: true,
                    });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [questionId]);

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