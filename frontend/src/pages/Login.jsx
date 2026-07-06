import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      // API_DOCUMENTATION says returns token + user object
      if (res.data && res.data.token) {
        login(res.data.user, res.data.token);
        navigate('/home');
      } else {
        setError('Login failed, unexpected response.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-glow"></div>
      
      <Card glass className="auth-card" padding="lg">
        <div className="auth-header">
          <h2>Welcome Back to <span>Rabbit</span> 🐰</h2>
          <p>The anonymous community for your college.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <Input 
            type="email"
            placeholder="College Email (e.g. student@college.edu.in)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
          />
          <Input 
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            required
          />
          
          <div className="auth-actions">
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <Button type="submit" variant="primary" fullWidth isLoading={loading} size="lg">
            Sign In
          </Button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Join Anonymously</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
