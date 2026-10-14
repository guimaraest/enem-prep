import type { File, QuestionId } from '../models';

interface QuestionImageProps {
    file: File;
    questionId: QuestionId;
    alt: string;
}

export function QuestionImage({ file, questionId, alt }: QuestionImageProps) {
    const src = file.url.startsWith('http://') || file.url.startsWith('https://')
        ? file.url
        : `/questions/${encodeURIComponent(questionId)}/${file.url.split('/').map(encodeURIComponent).join('/')}`;

    return <img className="question-image" src={src} alt={alt} loading="lazy" />;
}
