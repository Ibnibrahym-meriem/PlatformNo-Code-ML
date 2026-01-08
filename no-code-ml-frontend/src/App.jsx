import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// --- IMPORTS ---
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Documentation from './pages/Documentation/Documentation'; 
import Ingestion from './pages/Ingestion/Ingestion';
import Visualization from './pages/Visualization/Visualization';
import DataLab from './pages/Lab/DataLab';
import ModelTraining from './pages/Training/Training';
import Results from './pages/Results/Results'; 

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* --- Routes Publiques (Sans Menu) --- */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* --- DASHBOARD (Avec Menu Latéral) --- */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            
            {/* ✅ CORRECTION ICI : "docs" est devenu "documentation" pour correspondre à votre URL */}
            <Route path="/documentation" element={<Documentation />} />
            
            <Route path="/ingestion" element={<Ingestion />} />
            <Route path="/visualization" element={<Visualization />} />
            <Route path="/lab" element={<DataLab />} />
            <Route path="/training" element={<ModelTraining />} />
            <Route path="/results" element={<Results />} />

          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;