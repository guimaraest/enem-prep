import { Question } from './components/Question/Question'
import { Nav } from './components/Nav/Nav'

function App() {
  return (
    <>
      <Nav
          items={[
            { label: 'home', url: '/' },
          ]}
      />
      <main>
        <div className="section">
          <div className="section-container">
            <h1>study tool</h1>
            <div className="section-content">
              <Question number={136} />
              <Question number={137} />
              <Question number={138} />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default App