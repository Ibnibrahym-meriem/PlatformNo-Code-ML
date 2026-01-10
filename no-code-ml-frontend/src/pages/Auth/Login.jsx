import { useState, useEffect } from 'react'; // Ajout de useEffect
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ NETTOYAGE DE SÉCURITÉ AU CHARGEMENT DE LA PAGE
  useEffect(() => {
    localStorage.removeItem('current_session_id');
    localStorage.removeItem('current_filename');
    localStorage.removeItem('last_training_results');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      // Redirection vers la documentation comme demandé
      navigate('/documentation'); 
    } catch (err) {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // 'relative' permet de positionner la flèche par rapport à l'écran entier
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      
      {/* ✅ FLÈCHE SIMPLE & CLIQUABLE (Position Absolue + Z-Index) */}
      <div className="absolute top-6 left-6 z-50">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to home</span>
        </Link>
      </div>

      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
          
          {/* Logo Éclair */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-orange-600 rounded-xl mx-auto text-white flex items-center justify-center shadow-md mb-4">
                <Zap size={24} fill="currentColor" strokeWidth={0} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-2">Sign in to continue to your dashboard</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                placeholder="you@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-2.5 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account? <Link to="/register" className="text-orange-600 font-semibold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;