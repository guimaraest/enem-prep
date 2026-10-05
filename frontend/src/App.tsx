import { Question } from './components/Question/Question'
import { Nav } from './components/Nav/Nav'

function App() {
  return (
    <main className="section">
      <Nav
        items={[
          { label: 'home', url: '/' },
          { label: 'questões', url: '/questions' },
          { label: 'sobre', url: '/about' },
        ]}
      />
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