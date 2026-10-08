import './CheckAnswerButton.css';

import type { Question } from '../../models';

interface CheckAnswerButtonProps {
    question: Question;
    checkAnswer: () => void;
}

export function CheckAnswerButton({
    question,
    checkAnswer,
}: CheckAnswerButtonProps) {
    return (
        <button
            className="check-button hover"
            onClick={() => checkAnswer()}
        >
            conferir
        </button>
    );
}