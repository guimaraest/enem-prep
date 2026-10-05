import './Question.css'

interface QuestionProps {
  number: number
}

export function Question({ number }: QuestionProps) {
  return (
    <div className="question">
      {number}
    </div>
  )
}