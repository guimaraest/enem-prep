import './QuestionPage.css';

import { api } from '../api';

import { useParams } from 'react-router';

import { AlternativesList } from './AlternativesList/AlternativesList';
import { CheckAnswerButton } from './CheckAnswerButton/CheckAnswerButton';

import * as constants from '../constants';
import type { Question } from '../models';

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
                <QuestionHeader question={question} />

                <div>
                    <p className='content'>{question.content.problem}</p>

                    {question.content.files.map((file) => (
                        <img
                            key={file.url}
                            src={file.url}
                            alt=""
                        />
                    ))}
                </div>

                <AlternativesList question={question} />
                <CheckAnswerButton question={question} />
            </div>
        </section>
    );
}
