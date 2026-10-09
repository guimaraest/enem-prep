import './AlternativesList.css';

import { useState } from 'react';

import type { Alternative, Question } from '../../models';

type AlternativeResult = 'correct' | 'incorrect' | null;

interface QuestionAlternativeProps {
    alternative: Alternative;
    selected: boolean;
    result: AlternativeResult;
    onSelect: () => void;
}

function QuestionAlternative({
    alternative,
    selected,
    result,
    onSelect,
}: QuestionAlternativeProps) {
    const [crossedOut, setCrossedOut] = useState(false);

    const classNames = ['alternative'];

    if (selected) classNames.push('alternative-selected');
    if (crossedOut) classNames.push('alternative-crossed-out');
    if (result === 'correct') classNames.push('alternative-correct');
    if (result === 'incorrect') classNames.push('alternative-incorrect');

    const className = classNames.join(' ');

    return (
        <div
            className={className}
            onClick={onSelect}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (
                    event.key === 'Enter' ||
                    event.key === ' '
                ) {
                    event.preventDefault();
                    onSelect();
                }
            }}
            aria-pressed={selected}
        >
            <button
                type="button"
                className="alternative-select"
                onClick={(event) => {
                    event.stopPropagation();
                    onSelect();
                }}
                aria-label={`Selecionar alternativa ${alternative.index}`}
                aria-pressed={selected}
            >
                <span className="alternative-circle">
                    {selected && (
                        <span className="alternative-circle-inner" />
                    )}
                </span>

                <span className="alternative-index">
                    {alternative.index})
                </span>
            </button>

            <span className="alternative-text">
                {alternative.text}
            </span>
        </div>
    );
}

interface AlternativesListProps {
    question: Question;
    selectedIndex: Alternative['index'] | null;
    isChecked: boolean;
    isCorrect: boolean | null;
    onSelectIndex: (index: Alternative['index']) => void;
}

export function AlternativesList({
    question,
    selectedIndex,
    isChecked,
    isCorrect,
    onSelectIndex,
}: AlternativesListProps) {
    return (
        <div className="alternative-list">
            {question.content.alternatives.map((alternative) => {
                const selected = selectedIndex === alternative.index;

                let result: AlternativeResult = null;

                if (isChecked && selected) {
                    result = isCorrect ? 'correct' : 'incorrect';
                }

                return (
                    <QuestionAlternative
                        key={alternative.index}
                        alternative={alternative}
                        selected={selected}
                        result={result}
                        onSelect={() => onSelectIndex(alternative.index)}
                    />
                );
            })}
        </div>
    );
}