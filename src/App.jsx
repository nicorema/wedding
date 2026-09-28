import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AudioProvider } from "./contexts/AudioContext";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import OurStory from "./pages/OurStory";
import When from "./pages/When";
import Games from "./pages/Games";
import Photos from "./pages/Photos";
import Messages from "./pages/Messages";
import Details from "./pages/Details";
import Details2 from "./pages/Details2";
import Details3 from "./pages/Details3";
import Manager from "./pages/Manager";
import InvitationRPG from "./pages/InvitationRPG";

function App() {
  return (
    <AudioProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route
            path="/manager"
            element={<Navigate to="/manager/mensajes" replace />}
          />
          <Route path="/manager/:section" element={<Manager />} />
          <Route path="/invitacion" element={<InvitationRPG />} />
          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route
            path="/nuestra-historia"
            element={
              <Layout>
                <OurStory />
              </Layout>
            }
          />
          <Route
            path="/cuando"
            element={
              <Layout>
                <When />
              </Layout>
            }
          />
          <Route
            path="/juegos"
            element={
              <Layout>
                <Games />
              </Layout>
            }
          />
          <Route
            path="/fotos"
            element={
              <Layout>
                <Photos />
              </Layout>
            }
          />
          <Route
            path="/mensajes"
            element={
              <Layout>
                <Messages />
              </Layout>
            }
          />
          <Route
            path="/detalles"
            element={
              <Layout>
                <Details />
              </Layout>
            }
          />
          <Route
            path="/detalles2"
            element={
              <Layout>
                <Details2 />
              </Layout>
            }
          />
          <Route
            path="/detalles3"
            element={
              <Layout>
                <Details3 />
              </Layout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AudioProvider>
  );
}

export default App;
