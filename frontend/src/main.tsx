import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './base.css'

import { BrowserRouter, Routes, Route, Navigate } from "react-router";

import { QuestionPage } from "./pages/QuestionPage";
import { BankPage } from "./pages/BankPage";

import { Nav } from './components/Nav/Nav'


export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav
        items={[
          { label: 'Perguntas', url: '/perguntas' },
        ]}
      />
      <main>
        {children}
      </main>
    </>
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
                            <BankPage/>
                          </Layout>
                        } 
                      />
                    <Route path="/perguntas/:id" element={
                          <Layout>
                            <QuestionPage/>
                          </Layout>
                        } 
                      />
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
