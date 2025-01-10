import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import BackgroundCanvas from './components/BackgroundCanvas';
import Dashboard from './pages/Dashboard';
import Agenda from './pages/Agenda';

function App() {
  console.log('Renderizando App'); // Para debug

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  console.log('Ruta actual:', location.pathname); // Para debug

  return (
    <div className="relative min-h-screen bg-gray-50">
      <BackgroundCanvas />
      <Header />
      <main className="relative z-10 container mx-auto px-4 pt-28 pb-12">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="*" element={
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">404 - Página no encontrada</h2>
              <p className="text-gray-600">La página que buscas no existe.</p>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;
