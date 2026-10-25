import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './base.css'

import { BrowserRouter, Routes, Route, Navigate } from "react-router";

import { QuestionRoute } from "./question";
import { BankRoute } from "./bank";

import { Nav } from './shared/Nav/Nav'
import { Footer } from './shared/Footer/Footer'
import './shared/Footer/Footer.css'

function StubPage({ title }: { title: string }) {
  return (
    <section className="section">
      <div className="stub-page">
        <h1 className="heading-small">{title}</h1>
        <p>em breve</p>
      </div>
    </section>
  )
}


export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <Nav
        items={[
          { label: 'perguntas', url: '/perguntas' },
        ]}
      />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  )
}

function AppRoutes() {
    return ( 
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navigate to="/perguntas" replace />}  />
                    <Route path="/perguntas" element={
                          <Layout>
                            <BankRoute />
                          </Layout>
                        } 
                      />
                    <Route path="/perguntas/:id" element={
                          <Layout>
                            <QuestionRoute />
                          </Layout>
                        } 
                      />
                    <Route path="/politica-de-privacidade" element={
                          <Layout><StubPage title="política de privacidade" /></Layout>
                      } />
                    <Route path="/configuracoes" element={
                          <Layout><StubPage title="configurações" /></Layout>
                      } />
                    <Route path="/gerir-dados" element={
                          <Layout><StubPage title="gerir dados" /></Layout>
                      } />
                </Routes>
            </BrowserRouter> 
        </>
    ) 
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRoutes/>
  </StrictMode>,
)
