import './QuestionPage.css';

import { api } from '../api';

import { useParams } from 'react-router';
import { useState } from 'react';

import { CheckAnswerButton } from './CheckAnswerButton';

import * as constants from '../constants';
import type { Question, Alternative } from '../models';

function QuestionHeader({ question }: { question: Question }) {
    const difficulty =
        question.difficulty !== null
            ? constants.difficultyMap[question.difficulty]
            : undefined;

    return (
        <div className="question-header">
            <div className="row">
                <h1 className="question-title">
                    <span className='question-label'>{question.label} - </span>{question.title}
                </h1>
            </div>
            <div className="row" style={{ gap: 'var(--space-2)' }}>
                {question.source && (
                    <span className="chip">
                        {question.source}
                    </span>
                )}

                {difficulty && (
                    <span className={`chip ${difficulty.className}`}>
                        {difficulty.label}
                    </span>
                )}

                {question.subject && (
                    <span className="chip">
                        {question.subject}
                    </span>
                )}
            </div>
        </div>
    );
}

interface QuestionAlternativeProps {
    key: Alternative['index'];
    question: Question;
    alternative: Alternative;
    selected: boolean;
    displayResult: boolean;
    onSelect: () => void;
}

function QuestionAlternative({
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

function QuestionOrchestrator({ question }: { question: Question }) {
    const [selectedIndex, setSelectedIndex] =
        useState<Alternative['index'] | null>(null);

    const [revealedIndex, setRevealedIndex] =
        useState<Alternative['index'] | null>(null);

    const correctIndex = question.content.correctAlternative;

    function checkAnswer(): void {
        setRevealedIndex(selectedIndex);
    }

    function onSelectIndex(index: Alternative['index']): void {
        setSelectedIndex(index);
    }

    return (
        <>
            <QuestionHeader question={question} />

            <div>
                <p className="content">{question.content.problem}</p>

                {question.content.files.map((file) => (
                    <img key={file.url} src={file.url} alt="" />
                ))}
            </div>

            <div className="alternative-list">
                {question.content.alternatives.map((alternative) => {
                    const selected = selectedIndex === alternative.index;
                    const revealed = revealedIndex === alternative.index;

                    return (
                        <QuestionAlternative
                            key={alternative.index}
                            question={question}
                            alternative={alternative}
                            selected={selected}
                            displayResult={revealed}
                            onSelect={() => onSelectIndex(alternative.index)}
                        />
                    );
                })}
            </div>

            <CheckAnswerButton
                question={question}
                checkAnswer={checkAnswer}
            />
        </>
    );
}

export function QuestionPage() {
    const { id } = useParams();

    const question = id ? api.getQuestion(id) : undefined;
    
    if (!question) {
        return (
            <section>
                <div>
                    <h1>ERRO: questão não encontrada</h1>
                </div>
            </section>
        );
    }

    return (
        <section>
            <div className="question-parent">
                <QuestionOrchestrator question={question}/>
            </div>
        </section>
    );
}
