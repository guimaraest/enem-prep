import { useState } from 'react';

import { PrimaryButton } from '../shared/PrimaryButton/PrimaryButton';
import { AnswerChoice } from './AnswerChoice';
import { UserControls } from './UserControls';
import { QuestionNav } from './QuestionNav';
import { QuestionImage } from './QuestionImage';

import * as constants from '../constants';
import type { Question, Alternative, QuestionId } from '../models';

declare global {
    interface Window {
        umami?: {
            track: (eventName: string, eventData?: Record<string, string | number | boolean>) => void;
        };
    }
}

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
                <span className="question-label question-title-label oldstyle">{question.label}</span>
                <UserControls bookmarked={bookmarked} saving={savingBookmark} error={bookmarkError} onToggleBookmark={onToggleBookmark} />
            </div>
            <h1 className="question-title">
                {question.title || `questão ${question.label} - ${question.source}`}
            </h1>
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
            const isCorrect = selectedIndex === question.content.correctAlternative;
            window.umami?.track('answer-checked', { correct: isCorrect });
            onAttempt(selectedIndex, isCorrect);
        }
    }

    function onSelectIndex(index: Alternative['index']): void {
        setSelectedIndex(index);
    }

    const embeddedImages = [...question.content.problem.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)];
    const remainingFiles = question.content.files.filter((file) =>
        !embeddedImages.some((match) => match[1]?.split('/').at(-1) === file.url.split('/').at(-1)),
    );
    const problemParts = question.content.problem.split(/(!\[[^\]]*\]\([^)]+\))/g);

    return (
        <>
            <QuestionHeader question={question} {...userControls} />

            <div>
                <div className="content">
                    {problemParts.map((part, index) => {
                        const imageMatch = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(part);
                        if (imageMatch) {
                            const file = question.content.files.find((candidate) =>
                                candidate.url.split('/').at(-1) === imageMatch[2]?.split('/').at(-1),
                            ) ?? { url: imageMatch[2], type: 'image' as const };
                            return <QuestionImage key={`${file.url}-${index}`} file={file} questionId={question.id} alt={imageMatch[1] || 'Imagem da questão'} />;
                        }
                        return part.trim() ? <p key={index}>{part}</p> : null;
                    })}
                    {remainingFiles.map((file) => (
                        <QuestionImage key={file.url} file={file} questionId={question.id} alt="Imagem da questão" />
                    ))}
                </div>
                {question.content.command && <p className="content">{question.content.command}</p>}
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
