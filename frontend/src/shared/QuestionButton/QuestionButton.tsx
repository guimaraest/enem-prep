import './QuestionButton.css';
import { Link } from 'react-router';
import type { QuestionId } from '../../models';

interface QuestionButtonProps {
    questionId: QuestionId;
    label: number;
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