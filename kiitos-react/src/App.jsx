import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import BackgroundCanvas from './components/BackgroundCanvas';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <BackgroundCanvas />
        <Header />
        <main className="container mx-auto px-4 pt-24">
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
