import './QuestionPage.css';

import { api } from '../api';

import { useParams } from 'react-router';

import * as constants from '../constants';
import type { Difficulty } from '../models';

interface QuestionHeaderProps {
    question: {
        label: string;
        title: string;
        source: string | null;
        difficulty: Difficulty | null;
        subject: string | null;
    };
}

function QuestionHeader({ question }: QuestionHeaderProps) {
    const difficulty =
        question.difficulty !== null
            ? constants.difficultyMap[question.difficulty]
            : undefined;

    return (
        <div className="question-header">
            <div className="row" style={{ gap: 'var(--space-4)' }}>
                <span className="question-label">
                    {question.label}
                </span>

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

            <div className="row">
                <h1 className="question-title">
                    {question.title}
                </h1>
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
                    <p>{question.content.problem}</p>

                    {question.content.files.map((file) => (
                        <img
                            key={file.url}
                            src={file.url}
                            alt=""
                        />
                    ))}
                </div>

                <div>
                    {question.content.alternatives.map((alternative) => (
                        <div key={alternative.index}>
                            {alternative.index}) {alternative.text}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
