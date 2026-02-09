import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import OurStory from './pages/OurStory'
import When from './pages/When'
import Games from './pages/Games'
import Photos from './pages/Photos'
import Messages from './pages/Messages'
import Details from './pages/Details'
import Manager from './pages/Manager'

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/manager" element={<Manager />} />
        <Route path="/" element={
          <Layout>
            <Home />
          </Layout>
        } />
        <Route path="/nuestra-historia" element={
          <Layout>
            <OurStory />
          </Layout>
        } />
        <Route path="/cuando" element={
          <Layout>
            <When />
          </Layout>
        } />
        <Route path="/juegos" element={
          <Layout>
            <Games />
          </Layout>
        } />
        <Route path="/fotos" element={
          <Layout>
            <Photos />
          </Layout>
        } />
        <Route path="/mensajes" element={
          <Layout>
            <Messages />
          </Layout>
        } />
        <Route path="/detalles" element={
          <Layout>
            <Details />
          </Layout>
        } />
      </Routes>
    </Router>
  )
}

export default App

