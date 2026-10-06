import './QuestionButton.css';
import { Link } from 'react-router';

interface QuestionButtonProps {
    questionIndex: number;
}

export function QuestionButton({ questionIndex }: QuestionButtonProps) {
    return (
        <Link
            className="question hover"
            to={`/perguntas/${questionIndex}`}
        >
            {questionIndex}
        </Link>
    );
}