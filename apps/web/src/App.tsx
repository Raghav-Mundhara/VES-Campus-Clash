import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SessionGuard } from './lib/sessionGuard'

import Landing from './pages/Landing'
import Register from './pages/Register'
import Game from './pages/Game'
import Result from './pages/Result'

function App() {
  return (
    <BrowserRouter>
      <SessionGuard>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/game" element={<Game />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </SessionGuard>
    </BrowserRouter>
  )
}

export default App
