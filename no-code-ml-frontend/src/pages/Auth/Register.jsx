import React, { useState } from 'react';
import authService from '../../services/auth.service';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Zap } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if(password.length < 3) {
        setError("Le mot de passe est trop court.");
        setLoading(false);
        return;
    }

    try {
      await authService.register({ email, password });
      alert("Compte créé avec succès ! Connectez-vous.");
      navigate('/login');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 400) {
        setError("Cet email est déjà utilisé.");
      } else {
        setError("Erreur lors de l'inscription.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // 'relative' ici permet de positionner la flèche par rapport à cet écran
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
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="text-gray-500 text-sm mt-2">Start building ML models in minutes</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100">{error}</div>}

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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account? <Link to="/login" className="text-orange-600 hover:text-orange-700 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;