import { useState } from 'react';

import { PrimaryButton } from '../shared/PrimaryButton/PrimaryButton';
import { AnswerChoice } from './AnswerChoice';
import { UserControls } from './UserControls';
import { QuestionNav } from './QuestionNav';

import * as constants from '../constants';
import type { Question, Alternative } from '../models';

function QuestionHeader({ question }: { question: Question }) {
    const difficulty =
        question.difficulty !== null
            ? constants.difficultyMap[question.difficulty]
            : undefined;

    const subject =
        question.subject !== null
            ? constants.subjectMap[question.subject]
            : undefined;

    return (
        <div className="question-header">
            <div className="row top-row">
                <h1 className="question-title">
                    <span className='question-label'>{question.label} - </span>{question.title}
                </h1>
                <UserControls questionId={question.id} />
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

                {subject && (
                    <span className={`chip ${subject.className}`}>
                        {subject.label}
                    </span>
                )}
            </div>
        </div>
    );
}

export function QuestionContainer({ question }: { question: Question }) {
    const [selectedIndex, setSelectedIndex] =
        useState<Alternative['index'] | null>(null);

    const [revealedIndex, setRevealedIndex] =
        useState<Alternative['index'] | null>(null);

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
                        <AnswerChoice
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
            
            <div className='row bottom-row'>
                <PrimaryButton
                    text={'conferir'}
                    onPress={checkAnswer}
                />

                <QuestionNav questionId={question.id} />
            </div>
        </>
    );
}