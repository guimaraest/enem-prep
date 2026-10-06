import './QuestionPage.css';

import * as constants from '../constants';
import { api } from '../api';

import { useParams } from 'react-router';
import type { Difficulty } from '../models';

export function QuestionPage() {
    const { id } = useParams();

    const question = id ? api.getQuestion(id) : undefined;

    if (!question) {
        return <section><h1>ERRO: questão não encontrada</h1></section>;
    }

    const difficulty =
        question.difficulty !== null
            ? constants.difficultyMap[question.difficulty]
            : undefined;
    
    return (
        <section>
            <div>
                <div className='top-card'>
                    <div className="chips-parent">
                        <span className="heading-big">
                            {question.label}
                        </span>

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
                    <div>
                        <h1 className='question-title'>{question.title}</h1>
                    </div>
                </div>
                <p>
                    Difficulty: {question.difficulty}
                </p>

                <p>
                    Subject: {question.subject}
                </p>

                <div>
                    <p>{question.content.problem}</p>

                    {question.content.files.map((file) => (
                        <img
                            key={file.url}
                            src={file.url}
                            alt=""
                        />
                    ))}

                    {question.content.alternatives.map((alternative) => (
                        <div key={alternative.index}>
                            {alternative.index}) {alternative.text}
                        </div>
                    ))}
                </div>

                <p>
                    Explanation: {question.content.explanation}
                </p>
            </div>
        </section>
    );
}