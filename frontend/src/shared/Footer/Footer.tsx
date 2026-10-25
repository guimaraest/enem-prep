import './Footer.css'
import { Link } from 'react-router'
import { Github } from 'iconoir-react'

const footerLinks = [
  { label: 'política de privacidade', to: '/politica-de-privacidade' },
  { label: 'configurações', to: '/configuracoes' },
  { label: 'gerir dados', to: '/gerir-dados' },
]

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <nav aria-label="rodapé">
          <ul className="footer-links">
            {footerLinks.map((link) => (
              <li key={link.to}>
                <Link className="link footer-link hover" to={link.to}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="GitHub">
          <ul className="footer-links footer-social-links">
            <li>
              <a
                className="link footer-link footer-github-link hover"
                href="https://github.com/guimaraest"
                target="_blank"
                rel="noreferrer"
              >
                <Github aria-hidden="true" />
                <span>github</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}
