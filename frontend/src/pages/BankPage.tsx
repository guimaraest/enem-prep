import './BankPage.css'
import { api } from '../api';
import { QuestionButton } from '../components/QuestionButton/QuestionButton';

export function BankPage() {
  const questions = api.getQuestions();

  return (
        <section className="section">
            <div>
                <h1>stub bank page</h1>
            </div>
            <div>
              {questions.map((question) => (
                  <QuestionButton key={question.index} questionIndex={question.index} />
              ))}
            </div>
        </section>
    );
}