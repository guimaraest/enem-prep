import './Nav.css'

export function Nav({items}: {
  items: { label: string; url: string }[]
}) {
  return (
    <header className="header">
      <div className="header-container">
        <div className="nav-wrapper">
          <nav id="primary-nav" className="nav">
            <ul>
              {items.map((item) => (
                <li key={item.url}>
                  <a href={item.url} className="link nav-link hover">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}