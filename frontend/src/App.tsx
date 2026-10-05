import { Question } from './components/Question/Question'

function App() {
  return (
    <main className="section">
      <div className="section-container">
        <div className="section-content">
          <Question number={136} />
          <Question number={137} />
          <Question number={138} />
        </div>
      </div>
    </main>
  )
}

export default App