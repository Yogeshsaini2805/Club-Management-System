import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Eye, EyeOff, ArrowRight, Mail, Lock, User, Hash, GraduationCap } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rollNo, setRollNo] = useState('');
  const [branch, setBranch] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.endsWith('@jecrcu.edu.in')) {
      setError('Registration is restricted to valid JECRC University email IDs (@jecrcu.edu.in).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, roll_no: rollNo, branch, password })
      });

      if (response.ok) {
        // Automatically log them in after successful registration
        const result = await login(email, password);
        if (result.success) {
          navigate('/');
        } else {
          setError(result.message);
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.detail || 'Registration failed.');
      }
    } catch (err) {
      setError('Unable to connect to the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="aurora-bg" style={{ paddingBottom: '3rem' }}>
      {/* Animated Floating Shapes */}
      <div className="glass-floating-shape" style={{ width: '500px', height: '500px', background: '#ff3366', top: '-5%', left: '-10%', opacity: 0.25 }}></div>
      <div className="glass-floating-shape" style={{ width: '400px', height: '400px', background: '#007bff', bottom: '-10%', right: '-5%', opacity: 0.2, animationDelay: '-3s' }}></div>
      <div className="glass-floating-shape" style={{ width: '350px', height: '350px', background: '#5c38e6', top: '50%', left: '70%', opacity: 0.25, animationDelay: '-6s' }}></div>

      <div className="auth-header">
        <Link to="/home" className="auth-header-logo">
          <span className="logo-blue" style={{ fontSize: '1.5rem', fontWeight: 800 }}>JECRC</span> 
          <span className="logo-pink" style={{ fontSize: '1.4rem' }}>Club Portal</span>
        </Link>
      </div>

      <div className="auth-title-section">
        <div className="auth-badge" style={{ background: '#fdf2f8', color: '#db2777' }}>
          Join the JECRC Community! <span role="img" aria-label="party">🎉</span>
        </div>
        <h1 className="auth-title">
          Create Your <br/>
          <span className="auth-title-highlight" style={{ color: '#007bff' }}>Account</span>
        </h1>
        <p className="auth-subtitle" style={{ maxWidth: '300px', marginInline: 'auto' }}>
          Be a part of clubs, initiatives and events that shape your future.
        </p>
      </div>

      <div className="glass-auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-card-header">
          <h2 className="auth-card-title">
            Register <span className="auth-card-title-highlight">Now</span>
          </h2>
          <p className="auth-card-subtitle">
            Fill in the details to get started
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
            <label className="auth-form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
               <div className="auth-input-icon">
                 <User size={18} />
               </div>
               <input
                 type="text"
                 className="premium-input"
                 placeholder="Enter your full name"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 required
               />
            </div>
          </div>

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
            <small style={{ display: 'block', marginTop: '0.4rem', color: '#94a3b8', fontSize: '0.8rem' }}>Must be a valid @jecrcu.edu.in address.</small>
          </div>

          <div className="form-group">
            <label className="auth-form-label">College Roll Number</label>
            <div style={{ position: 'relative' }}>
               <div className="auth-input-icon">
                 <Hash size={18} />
               </div>
               <input
                 type="text"
                 className="premium-input"
                 placeholder="Enter your roll number"
                 value={rollNo}
                 onChange={(e) => setRollNo(e.target.value)}
                 required
               />
            </div>
          </div>

          <div className="form-group">
            <label className="auth-form-label">Department</label>
            <div style={{ position: 'relative' }}>
               <div className="auth-input-icon">
                 <GraduationCap size={18} />
               </div>
               <select
                 className="premium-input"
                 value={branch}
                 onChange={(e) => setBranch(e.target.value)}
                 style={{ paddingLeft: '42px', appearance: 'none' }}
                 required
               >
                 <option value="" disabled>Select your department</option>
                 <option value="B.Tech CSE">B.Tech CSE</option>
                 <option value="B.Tech AI/ML">B.Tech AI/ML</option>
                 <option value="BCA">BCA</option>
                 <option value="B.Sc IT">B.Sc IT</option>
                 <option value="BBA">BBA</option>
                 <option value="Other">Other</option>
               </select>
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
                placeholder="Create a password"
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

          <div className="form-group">
            <label className="auth-form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <div className="auth-input-icon">
                 <Lock size={18} />
               </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="premium-input"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ paddingRight: '40px' }}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="auth-password-toggle"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '2rem', marginTop: '1.5rem' }}>
            <label className="custom-checkbox">
              <input type="checkbox" required /> 
              <span>I agree to the <a href="/" onClick={(e) => e.preventDefault()} style={{color: '#007bff'}}>Terms & Conditions</a> and <a href="/" onClick={(e) => e.preventDefault()} style={{color: '#007bff'}}>Privacy Policy</a></span>
            </label>
          </div>

          <button type="submit" disabled={isSubmitting} className="auth-submit-btn" style={{ boxShadow: '0 8px 25px rgba(255, 51, 102, 0.4)' }}>
            {isSubmitting ? 'Creating Account...' : <>Create Account <ArrowRight size={18} /></>}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login" className="auth-footer-link">Login &rarr;</Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
