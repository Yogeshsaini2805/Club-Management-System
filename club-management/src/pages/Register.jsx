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
        <Link to="/home" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}>
          <span className="logo-blue" style={{ fontSize: '1.5rem', fontWeight: 800 }}>JECRC</span> 
          <span className="logo-pink" style={{ fontSize: '1.4rem' }}>Club Portal</span>
        </Link>
      </div>

      <div className="auth-title-section">
        <div style={{ display: 'inline-block', background: '#fdf2f8', color: '#db2777', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem' }}>
          Join the JECRC Community! <span role="img" aria-label="party">🎉</span>
        </div>
        <h1 style={{ fontSize: '3rem', color: '#0f172a', lineHeight: '1.1' }}>
          Create Your <br/>
          <span style={{ color: '#007bff' }}>Account</span>
        </h1>
        <p style={{ color: '#475569', marginTop: '1rem', fontSize: '1.05rem', maxWidth: '300px', marginInline: 'auto' }}>
          Be a part of clubs, initiatives and events that shape your future.
        </p>
      </div>

      <div className="glass-auth-card" style={{ maxWidth: '500px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: 800 }}>
            Register <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Now</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Fill in the details to get started
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
            <label className="form-label" style={{ fontSize: '0.85rem', color: '#0f172a' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
               <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
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
            <small style={{ display: 'block', marginTop: '0.4rem', color: '#94a3b8', fontSize: '0.8rem' }}>Must be a valid @jecrcu.edu.in address.</small>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.85rem', color: '#0f172a' }}>College Roll Number</label>
            <div style={{ position: 'relative' }}>
               <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
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
            <label className="form-label" style={{ fontSize: '0.85rem', color: '#0f172a' }}>Department</label>
            <div style={{ position: 'relative' }}>
               <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                 <GraduationCap size={18} />
               </div>
               <select
                 className="premium-input"
                 value={branch}
                 onChange={(e) => setBranch(e.target.value)}
                 style={{ paddingLeft: '40px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', appearance: 'none' }}
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
            <label className="form-label" style={{ fontSize: '0.85rem', color: '#0f172a' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                 <Lock size={18} />
               </div>
              <input
                type={showPassword ? "text" : "password"}
                className="premium-input"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.85rem', color: '#0f172a' }}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                 <Lock size={18} />
               </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="form-control"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ paddingLeft: '40px', paddingRight: '40px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center'
                }}
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

          <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '1rem', background: 'var(--accent-gradient)', color: 'white', border: 'none', borderRadius: '16px', fontSize: '1rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', boxShadow: '0 8px 25px rgba(255, 51, 102, 0.4)', opacity: isSubmitting ? 0.7 : 1 }} onMouseOver={(e) => !isSubmitting && (e.currentTarget.style.transform='translateY(-2px)')} onMouseOut={(e) => e.currentTarget.style.transform='translateY(0)'}>
            {isSubmitting ? 'Creating Account...' : <>Create Account <ArrowRight size={18} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2.5rem', color: '#0f172a', fontSize: '0.95rem', fontWeight: 500 }}>
          Already have an account? <Link to="/login" style={{ color: '#ff3366', fontWeight: '700', marginLeft: '0.5rem' }}>Login &rarr;</Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
