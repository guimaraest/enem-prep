import './QuestionPage.css';

import { api } from '../api';
import { useParams } from 'react-router';

export function QuestionPage() {
    const { index } = useParams();

    const question = api.getQuestions(Number(index));

    if (!question) {
        return <div>Question not found.</div>;
    }

    return (
        <section>
            <div>
                <h1>{question.title}</h1>

                <p>
                    Difficulty: {question.difficulty}
                </p>

                <p>
                    Subject: {question.subject}
                </p>

                <div>
                    <p>{question.content.problem}</p>

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