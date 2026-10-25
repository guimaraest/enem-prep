import './QuestionButton.css';
import { Link } from 'react-router';
import { BookmarkSolid, Check, Xmark } from 'iconoir-react';
import type { Difficulty, QuestionAttempt, QuestionId, Subject, UserQuestionData } from '../../models';

const USER_STATE_ICON_SIZE = 12;

interface QuestionButtonProps {
    questionId: QuestionId;
    label: number;
    difficulty: Difficulty | null;
    subject: Subject | null;
    userdata: UserQuestionData;
}

export function QuestionButton({ questionId, label, difficulty, userdata }: QuestionButtonProps) {
    const latestAttempt = userdata.attempts.reduce<QuestionAttempt | undefined>(
        (latest, attempt) => !latest || attempt.index > latest.index ? attempt : latest,
        undefined,
    );

    return (
        <Link
            className="question question-button hover oldstyle"
            to={`/perguntas/${questionId}`}
        >
            {label}
            <span className="question-button-indicators" aria-hidden="true">
                {(latestAttempt || userdata.isBookmarked) && (
                    <span className="question-button-userstate">
                        {latestAttempt
                            ? latestAttempt.isCorrect
                                ? <Check color="white" height={USER_STATE_ICON_SIZE} width={USER_STATE_ICON_SIZE} />
                                : <Xmark color="white" height={USER_STATE_ICON_SIZE} width={USER_STATE_ICON_SIZE} />
                            : <BookmarkSolid color="white" height={USER_STATE_ICON_SIZE} width={USER_STATE_ICON_SIZE} />}
                    </span>
                )}
                {difficulty !== null && (
                    <span className={`question-button-difficulty difficulty-${difficulty}`} />
                )}
            </span>
        </Link>
    );
}
