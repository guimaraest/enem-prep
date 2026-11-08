import { BankContainer } from './BankContainer'
import './bank.css'

export function BankRoute() {
  return (
    <section className="section">
      <h1 className="bank-title">questões do ENEM</h1>
      <BankContainer />
    </section>
  )
}