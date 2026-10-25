import './QuestionButton.css';
import { Link } from 'react-router';
import { BookmarkSolid } from 'iconoir-react';
import type { Difficulty, QuestionAttempt, QuestionId, Subject, UserQuestionData } from '../../models';

const BOOKMARK_ICON_SIZE = 18;

interface QuestionButtonProps {
    questionId: QuestionId;
    label: number;
    difficulty: Difficulty | null;
    subject: Subject | null;
    userdata: UserQuestionData;
    showUserState?: boolean;
}

export function QuestionButton({
    questionId,
    label,
    userdata,
    showUserState,
}: QuestionButtonProps) {
    const latestAttempt = userdata.attempts.reduce<QuestionAttempt | undefined>(
        (latest, attempt) => !latest || attempt.index > latest.index ? attempt : latest,
        undefined,
    );

    const answerState = showUserState && latestAttempt
        ? latestAttempt.isCorrect ? 'is-correct' : 'is-incorrect'
        : '';

    return (
        <Link
            className={`question question-button hover oldstyle ${answerState}`}
            data-umami-event="question-opened"
            to={`/perguntas/${questionId}`}
        >
            {label}
            {showUserState && userdata.isBookmarked && (
                <span className="question-button-indicators" aria-hidden="true">
                    <span className="question-button-bookmark">
                        <BookmarkSolid color="white" height={BOOKMARK_ICON_SIZE} width={BOOKMARK_ICON_SIZE} />
                    </span>
                </span>
            )}
        </Link>
    );
}
