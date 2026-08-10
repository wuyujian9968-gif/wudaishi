import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Grade from './pages/Grade'
import Learn from './pages/Learn'
import Dictation from './pages/Dictation'
import Review from './pages/Review'
import Sentences from './pages/Sentences'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/grade/:grade" element={<Grade />} />
        <Route path="/grade/:grade/unit/:unit/learn" element={<Learn />} />
        <Route path="/grade/:grade/unit/:unit/dictation" element={<Dictation />} />
        <Route path="/grade/:grade/unit/:unit/review" element={<Review />} />
        <Route path="/grade/:grade/unit/:unit/sentences" element={<Sentences />} />
        <Route path="/review-all" element={<Review />} />
      </Routes>
    </Layout>
  )
}

export default App
