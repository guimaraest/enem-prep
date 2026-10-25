import './Footer.css'
import { Link } from 'react-router'

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
      </div>
    </footer>
  )
}
