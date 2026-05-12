import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, demoLogin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/home');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Unable to connect to the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = () => {
    const result = demoLogin();
    if (result.success) {
      navigate('/home');
    }
  };

  return (
    <div className="aurora-bg">
      {/* Animated Floating Shapes */}
      <div className="glass-floating-shape" style={{ width: '450px', height: '450px', background: '#5c38e6', top: '-10%', left: '-5%', opacity: 0.3 }}></div>
      <div className="glass-floating-shape" style={{ width: '350px', height: '350px', background: '#ff3366', bottom: '-5%', right: '-5%', opacity: 0.25, animationDelay: '-4s' }}></div>
      <div className="glass-floating-shape" style={{ width: '300px', height: '300px', background: '#007bff', top: '40%', left: '60%', opacity: 0.2, animationDelay: '-2s' }}></div>

      <div className="auth-header">
        <Link to="/home" className="auth-header-logo">
          <span className="logo-blue" style={{ fontSize: '1.5rem', fontWeight: 800 }}>JECRC</span> 
          <span className="logo-pink" style={{ fontSize: '1.4rem' }}>Club Portal</span>
        </Link>
      </div>

      <div className="auth-title-section">
        <div className="auth-badge">
          Welcome Back! <span role="img" aria-label="wave">👋</span>
        </div>
        <h1 className="auth-title">
          Glad to see you <br/>
          <span className="auth-title-highlight">again!</span>
        </h1>
        <p className="auth-subtitle">
          Login to continue your journey<br/>and explore amazing opportunities.
        </p>
      </div>

      <div className="glass-auth-card">
        <div className="auth-card-header">
          <h2 className="auth-card-title">
            Login to <span className="auth-card-title-highlight">Your</span> Account
          </h2>
          <p className="auth-card-subtitle">
            Enter your credentials to access your account
          </p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="auth-form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
               <div className="auth-input-icon">
                 <Mail size={18} />
               </div>
               <input
                 type="email"
                 className="premium-input"
                 placeholder="Enter your email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
               />
            </div>
          </div>
          
          <div className="form-group">
            <label className="auth-form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <div className="auth-input-icon">
                 <Lock size={18} />
               </div>
              <input
                type={showPassword ? "text" : "password"}
                className="premium-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '40px' }}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="auth-password-toggle"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <label className="custom-checkbox">
              <input type="checkbox" /> Remember me
            </label>
            <a href="/" onClick={(e) => e.preventDefault()} className="auth-forgot-password">Forgot Password?</a>
          </div>

          <button type="submit" disabled={isSubmitting} className="auth-submit-btn">
            {isSubmitting ? 'Logging in...' : <>Login <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="auth-divider">
          <div className="auth-divider-line"></div>
          <span className="auth-divider-text">OR</span>
          <div className="auth-divider-line"></div>
        </div>

        <button onClick={handleDemoLogin} className="auth-demo-btn">
          Continue as Demo User
        </button>

        <p className="auth-footer-text">
          Don't have an account? <Link to="/register" className="auth-footer-link">Create Account &rarr;</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
