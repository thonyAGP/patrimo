import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { App } from './App'
import { ListeDossiers } from './pages/ListeDossiers'
import { PageDossier } from './pages/PageDossier'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<ListeDossiers />} />
          <Route path="dossier/:id" element={<PageDossier />} />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>
)
