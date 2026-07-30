import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SessionGuard } from './lib/sessionGuard'

import Landing from './pages/Landing'
import Register from './pages/Register'

const Game = () => <div className="text-white p-6">Game Placeholder</div>
const Result = () => <div className="text-white p-6">Result Placeholder</div>

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
