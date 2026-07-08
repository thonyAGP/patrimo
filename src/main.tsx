import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router-dom'
import '@fontsource/sora/600.css'
import '@fontsource/sora/700.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import { ListeDossiers } from './pages/ListeDossiers'
import { PageDossier } from './pages/PageDossier'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route index element={<ListeDossiers />} />
        <Route path="dossier/:id" element={<PageDossier />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
)
