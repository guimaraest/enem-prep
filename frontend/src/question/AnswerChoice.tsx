import { useState } from 'react';

import type { Question, Alternative } from '../models';

interface QuestionAlternativeProps {
    key: Alternative['index'];
    question: Question;
    alternative: Alternative;
    selected: boolean;
    displayResult: boolean;
    onSelect: () => void;
}

export function AnswerChoice({
    key,
    question,
    alternative,
    selected,
    displayResult,
    onSelect,
}: QuestionAlternativeProps) {
    const [crossedOut, setCrossedOut] = useState(false);

    const correctAlternative = question.content.correctAlternative;
    const isCorrect = alternative.index === correctAlternative;

    const classNames = ['alternative'];

    if (selected) classNames.push('alternative-selected');
    if (crossedOut) classNames.push('alternative-crossed-out');

    if (displayResult) {
        if (isCorrect) classNames.push('alternative-correct');
        else classNames.push('alternative-incorrect');
    }

    return (
        <button
            type="button"
            className={classNames.join(' ')}
            onClick={onSelect}
            aria-pressed={selected}
        >
            <span className="alternative-select">
                <span className="alternative-circle">
                    {selected && (
                        <span className="alternative-circle-inner" />
                    )}
                </span>

                <span className="alternative-index">{alternative.index})</span>
            </span>

            <span className="alternative-text">{alternative.text}</span>
        </button>
    );
}