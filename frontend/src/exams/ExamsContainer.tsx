import type { UserExamRecord } from '../api/userExams';

interface ExamsContainerProps {
    exams: UserExamRecord[];
}

export function ExamsContainer({ exams }: ExamsContainerProps) {
    return (
        <div> stub exams {exams.length} </div> 
    )
}
