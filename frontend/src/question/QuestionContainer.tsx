import { useState } from 'react';

import { PrimaryButton } from '../shared/PrimaryButton/PrimaryButton';
import { AnswerChoice } from './AnswerChoice';
import { UserControls } from './UserControls';
import { QuestionNav } from './QuestionNav';

import * as constants from '../constants';
import type { Question, Alternative, QuestionId } from '../models';

interface QuestionContainerProps {
    question: Question;
    bookmarked: boolean;
    savingBookmark: boolean;
    bookmarkError: string | null;
    onToggleBookmark: () => void;
    onAttempt: (selected: Alternative['index'], isCorrect: boolean) => void;
    previousId?: QuestionId;
    nextId?: QuestionId;
    navigationLoading: boolean;
    navigationError: boolean;
}

function QuestionHeader({ question, bookmarked, savingBookmark, bookmarkError, onToggleBookmark }: Pick<QuestionContainerProps, 'question' | 'bookmarked' | 'savingBookmark' | 'bookmarkError' | 'onToggleBookmark'>) {
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
                <UserControls bookmarked={bookmarked} saving={savingBookmark} error={bookmarkError} onToggleBookmark={onToggleBookmark} />
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

export function QuestionContainer({ question, onAttempt, previousId, nextId, navigationLoading, navigationError, ...userControls }: QuestionContainerProps) {
    const [selectedIndex, setSelectedIndex] =
        useState<Alternative['index'] | null>(null);

    const [revealedIndex, setRevealedIndex] =
        useState<Alternative['index'] | null>(null);

    function checkAnswer(): void {
        setRevealedIndex(selectedIndex);
        if (selectedIndex !== null) {
            onAttempt(selectedIndex, selectedIndex === question.content.correctAlternative);
        }
    }

    function onSelectIndex(index: Alternative['index']): void {
        setSelectedIndex(index);
    }

    return (
        <>
            <QuestionHeader question={question} {...userControls} />

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

                <QuestionNav previousId={previousId} nextId={nextId} loading={navigationLoading} error={navigationError} />
            </div>
        </>
    );
}
