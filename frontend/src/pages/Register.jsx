import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Key } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import './Auth.css';

const Register = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', { email, password });
      setStep(2); // Move to OTP verification
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Check your email format.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/verify-email', { email, otp });
      if (res.data && res.data.token) {
        login(res.data.user, res.data.token);
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-glow"></div>
      
      <Card glass className="auth-card" padding="lg">
        <div className="auth-header">
          <h2>Join <span>Rabbit</span> 🐰</h2>
          <p>
            {step === 1 ? 'Stay anonymous, connect with your college.' : 'Check your college email for the OTP.'}
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleRegister} className="auth-form">
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
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              required
              minLength={6}
            />
            
            <Button type="submit" variant="primary" fullWidth isLoading={loading} size="lg" style={{ marginTop: '16px' }}>
              Send OTP
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="auth-form">
             <Input 
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              icon={Key}
              required
              maxLength={6}
            />
            <Button type="submit" variant="primary" fullWidth isLoading={loading} size="lg" style={{ marginTop: '16px' }}>
              Verify & Join
            </Button>
            <div className="auth-actions" style={{ justifyContent: 'center', marginTop: '16px' }}>
              <button 
                type="button" 
                className="forgot-password" 
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setStep(1)}
              >
                Change Email
              </button>
            </div>
          </form>
        )}

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
