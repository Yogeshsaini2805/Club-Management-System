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
        <Link to="/home" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}>
          <span className="logo-blue" style={{ fontSize: '1.5rem', fontWeight: 800 }}>JECRC</span> 
          <span className="logo-pink" style={{ fontSize: '1.4rem' }}>Club Portal</span>
        </Link>
      </div>

      <div className="auth-title-section">
        <div style={{ display: 'inline-block', background: '#fff9e6', color: '#d97706', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>
          Welcome Back! <span role="img" aria-label="wave">👋</span>
        </div>
        <h1 style={{ fontSize: '3rem', color: '#0f172a', lineHeight: '1.1' }}>
          Glad to see you <br/>
          <span style={{ color: '#5c38e6' }}>again!</span>
        </h1>
        <p style={{ color: '#475569', marginTop: '1rem', fontSize: '1.05rem' }}>
          Login to continue your journey<br/>and explore amazing opportunities.
        </p>
      </div>

      <div className="glass-auth-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 800 }}>
            Login to <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Your</span> Account
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Enter your credentials to access your account
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.85rem', color: '#0f172a' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
               <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
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
            <label className="form-label" style={{ fontSize: '0.85rem', color: '#0f172a' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
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
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <label className="custom-checkbox">
              <input type="checkbox" /> Remember me
            </label>
            <a href="/" onClick={(e) => e.preventDefault()} style={{ color: '#5c38e6', fontSize: '0.9rem', fontWeight: 600 }}>Forgot Password?</a>
          </div>

          <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '1rem', background: 'var(--accent-gradient)', color: 'white', border: 'none', borderRadius: '16px', fontSize: '1rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', boxShadow: '0 8px 25px rgba(92, 56, 230, 0.4)', opacity: isSubmitting ? 0.7 : 1 }} onMouseOver={(e) => !isSubmitting && (e.currentTarget.style.transform='translateY(-2px)')} onMouseOut={(e) => e.currentTarget.style.transform='translateY(0)'}>
            {isSubmitting ? 'Logging in...' : <>Login <ArrowRight size={18} /></>}
          </button>
        </form>

        <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', textAlign: 'center', color: '#64748b' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.1)' }}></div>
          <span style={{ padding: '0 1rem', fontSize: '0.8rem', fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.1)' }}></div>
        </div>

        <button onClick={handleDemoLogin} style={{ width: '100%', padding: '0.9rem', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '16px', color: '#0f172a', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }} onMouseOver={(e) => e.currentTarget.style.background='white'} onMouseOut={(e) => e.currentTarget.style.background='rgba(255,255,255,0.7)'}>
          Continue as Demo User
        </button>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: '#0f172a', fontSize: '0.95rem', fontWeight: 500 }}>
          Don't have an account? <Link to="/register" style={{ color: '#ff3366', fontWeight: '700', marginLeft: '0.5rem' }}>Create Account &rarr;</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
