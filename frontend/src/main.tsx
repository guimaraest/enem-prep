import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './base.css'

import { BrowserRouter, Routes, Route, Navigate } from "react-router";

import { QuestionRoute } from "./question";
import { BankRoute } from "./bank";
import { ExamsRoute } from './exams';

import { Nav } from './shared/Nav/Nav'


export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav
        items={[
          { label: 'perguntas', url: '/perguntas' },
          { label: 'exams', url: '/exams' },
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
                    <Route path="/exams" element={
                          <Layout>
                            <ExamsRoute />
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
