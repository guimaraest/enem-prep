import './QuestionButton.css'

interface QuestionProps {
  number: number
}

export function QuestionButton({ number }: QuestionProps) {
  return (
    <div className="question">
      {number}
    </div>
  )
}