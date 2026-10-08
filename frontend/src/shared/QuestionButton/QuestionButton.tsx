import './QuestionButton.css';
import { Link } from 'react-router';

interface QuestionButtonProps {
    questionId: string;
    label: string;
}

export function QuestionButton({ questionId, label }: QuestionButtonProps) {
    return (
        <Link
            className="question hover"
            to={`/perguntas/${questionId}`}
        >
            {label}
        </Link>
    );
}