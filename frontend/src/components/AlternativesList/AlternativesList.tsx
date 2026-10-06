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
    setState: (state: AlternativeState) => void;
}

function QuestionAlternative({
    alternative,
    result = 'unchecked',
}: {
    alternative: Alternative;
    result?: AlternativeResult;
}) {
    const [selected, setSelected] = useState(false);
    const [crossedOut, setCrossedOut] = useState(false);

    const className = [
        'alternative',
        selected && 'alternative-selected',
        crossedOut && 'alternative-crossed-out',
        result === 'correct' && 'alternative-correct',
        result === 'incorrect' && 'alternative-incorrect',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={className}>
            <button
                type="button"
                className="alternative-select"
                onClick={() => setSelected((value) => !value)}
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

            <button
                type="button"
                className="alternative-cross"
                onClick={() => setCrossedOut((value) => !value)}
                aria-label={`Riscar alternativa ${alternative.index}`}
                aria-pressed={crossedOut}
            >
                -
            </button>
        </div>
    );
}

export function AlternativesList({ question }: { question: Question }) {
    return (
        <div className='alternative-list'>
            {question.content.alternatives.map((alternative) => (
                <QuestionAlternative
                    key={alternative.index}
                    alternative={alternative}
                />
            ))}
        </div>
    );
}