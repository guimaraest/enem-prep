import './QuestionPage.css';

import { useParams } from 'react-router';

import { api } from '../api';
import { QuestionContainer } from './QuestionContainer';



export function QuestionPage() {
    const { id } = useParams();

    const question = id ? api.questions.getById(id) : undefined;
    
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
                <QuestionContainer question={question}/>
            </div>
        </section>
    );
}
