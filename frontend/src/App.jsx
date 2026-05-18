import React from 'react'
import { Routes, Route } from 'react-router-dom'
import FeedbackFlow from './pages/FeedbackFlow'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<FeedbackFlow />} />
      <Route path="/feedback" element={<FeedbackFlow />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}