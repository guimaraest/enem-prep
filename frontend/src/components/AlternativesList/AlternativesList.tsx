import './AlternativesList.css';

import { useState } from 'react';

import type { Alternative, Question } from '../../models';

type AlternativeResult =
    | 'unchecked'
    | 'correct'
    | 'incorrect';

interface AlternativeState {
    selected: boolean;
    crossedOut: boolean;
    result: AlternativeResult;
}

interface QuestionAlternativeProps {
    alternative: Alternative;
    state: AlternativeState;
    select: () => void;
    toggleCrossOut: () => void;
}

function QuestionAlternative({
    alternative,
    state,
    select,
    toggleCrossOut,
}: QuestionAlternativeProps) {
    const className = [
        'alternative',
        state.selected && 'alternative-selected',
        state.crossedOut && 'alternative-crossed-out',
        state.result === 'correct' && 'alternative-correct',
        state.result === 'incorrect' && 'alternative-incorrect',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={className}>
            <button
                type="button"
                className="alternative-select"
                onClick={select}
                aria-label={`Selecionar alternativa ${alternative.index}`}
                aria-pressed={state.selected}
            >
                <span className="alternative-circle">
                    {state.selected && (
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

export function AlternativesList({ question }: { question: Question }) {
    type AlternativeIndex = Alternative['index'];

    const [selectedIndex, setSelectedIndex] =
        useState<AlternativeIndex | null>(null);

    const [crossedOut, setCrossedOut] = useState<Set<AlternativeIndex>>(
        () => new Set(),
    );

    const [correctIndex, setCorrectIndex] =
        useState<AlternativeIndex | null>(null);

    function select(index: AlternativeIndex) {
        if (correctIndex !== null) {
            return;
        }

        setSelectedIndex(index);
    }

    function toggleCrossOut(index: AlternativeIndex) {
        if (correctIndex !== null) {
            return;
        }

        setCrossedOut((current) => {
            const next = new Set(current);

            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }

            return next;
        });
    }

    function declareCorrect(index: AlternativeIndex) {
        if (selectedIndex === null) {
            return;
        }

        setCorrectIndex(index);
    }

    function getAlternativeState(
        alternative: Alternative,
    ): AlternativeState {
        const selected = selectedIndex === alternative.index;
        const isCrossedOut = crossedOut.has(alternative.index);

        if (correctIndex === null) {
            return {
                selected,
                crossedOut: isCrossedOut,
                result: 'unchecked',
            };
        }

        // Only the selected alternative receives a result.
        if (!selected) {
            return {
                selected: false,
                crossedOut: false,
                result: 'unchecked',
            };
        }

        return {
            selected: true,
            crossedOut: false,
            result:
                correctIndex === selectedIndex
                    ? 'correct'
                    : 'incorrect',
        };
    }

    return (
        <div className="alternative-list">
            {question.content.alternatives.map((alternative) => (
                <QuestionAlternative
                    key={alternative.index}
                    alternative={alternative}
                    state={getAlternativeState(alternative)}
                    select={() => select(alternative.index)}
                    toggleCrossOut={() =>
                        toggleCrossOut(alternative.index)
                    }
                />
            ))}

            {/* Temporary test button */}
            <button
                type="button"
                onClick={() => declareCorrect('a')}
                disabled={correctIndex !== null}
            >
                Declare A correct
            </button>
        </div>
    );
}