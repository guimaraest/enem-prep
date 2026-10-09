import './QuestionPage.css';

import { api } from '../api';

import { useParams } from 'react-router';
import { useState } from 'react';

import { AlternativesList } from './AlternativesList/AlternativesList';
import { CheckAnswerButton } from './CheckAnswerButton/CheckAnswerButton';

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

function QuestionOrchestrator({ question }: { question: Question }) {
    const [selectedIndex, setSelectedIndex] =
        useState<Alternative['index'] | null>(null);

    const [isChecked, setIsChecked] = useState(false);

    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const correctIndex = question.content.correctAlternative;

    function checkAnswer(): void {
        setIsChecked(true);
        setIsCorrect(selectedIndex === correctIndex);
    }

    function onSelectIndex(index: Alternative['index']): void {
        setIsCorrect(null);
        setIsChecked(false);
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

            <AlternativesList
                question={question}
                selectedIndex={selectedIndex}
                isChecked={isChecked}
                isCorrect={isCorrect}
                onSelectIndex={onSelectIndex}
            />

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
