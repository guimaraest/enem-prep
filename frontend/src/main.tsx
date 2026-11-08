import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './base.css'

import { BrowserRouter, Routes, Route } from "react-router";

import { QuestionRoute } from "./question";
import { BankRoute } from "./bank";

import { Nav } from './shared/Nav/Nav'
import { Footer } from './shared/Footer/Footer'
import './shared/Footer/Footer.css'
import { PrivacyPolicyRoute } from './settings/PrivacyPolicyRoute'
import { SettingsRoute } from './settings/SettingsRoute'
import { ManageDataRoute } from './settings/ManageDataRoute'
import { PageMetadata } from './shared/PageMetadata'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <Nav
        items={[
          { label: 'perguntas', url: '/' },
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
                <PageMetadata />
                <Routes>
                    <Route path="/" element={
                          <Layout>
                            <BankRoute />
                          </Layout>
                        }
                      />
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
                          <Layout><PrivacyPolicyRoute /></Layout>
                      } />
                    <Route path="/configuracoes" element={
                          <Layout><SettingsRoute /></Layout>
                      } />
                    <Route path="/gerir-dados" element={
                          <Layout><ManageDataRoute /></Layout>
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
