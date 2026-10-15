import type { UserExamRecord } from '../api/userExams';

interface ExamsContainerProps {
    exams: UserExamRecord[];
}

export function ExamsContainer({ exams }: ExamsContainerProps) {
    return <div className="exams-container" data-exam-count={exams.length} />;
}
