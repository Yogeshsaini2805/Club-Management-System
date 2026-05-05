import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, KeyRound, Save, AlertCircle, CheckCircle2, X } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'New passwords do not match!', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ text: 'New password must be at least 6 characters long.', type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          old_password: oldPassword,
          new_password: newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: 'Password changed successfully!', type: 'success' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setShowPasswordModal(false);
          setMessage({ text: '', type: '' });
        }, 2000);
      } else {
        setMessage({ text: data.detail || 'Failed to change password.', type: 'error' });
      }
    } catch (err) {
      // Fallback for mock data (when backend is not running)
      setMessage({ text: 'Unable to connect to backend server. Make sure Python FastAPI is running.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem', position: 'relative' }}>
      {/* Decorative background blurs specifically for profile */}
      <div style={{ position: 'absolute', top: '5%', right: '10%', width: '300px', height: '300px', background: 'var(--accent-primary)', filter: 'blur(120px)', opacity: 0.15, borderRadius: '50%', zIndex: -1 }}></div>
      <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: '250px', height: '250px', background: 'var(--accent-tertiary)', filter: 'blur(100px)', opacity: 0.15, borderRadius: '50%', zIndex: -1 }}></div>
      
      <div style={{ textAlign: 'center', marginBottom: '4rem', position: 'relative', zIndex: 1 }}>
        <h1 className="section-title" style={{ fontSize: '3.5rem', textShadow: '0 0 30px rgba(255,255,255,0.1)' }}>My Profile</h1>
        <p className="section-subtitle" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>Manage your account details and security settings.</p>
      </div>

      <div className="profile-grid">
        {/* User Details Section */}
        <div className="card glass-panel profile-card">
          <div className="profile-header">
            <div className="profile-avatar-large">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2>{user.name}</h2>
            <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
              {user.role}
            </span>
          </div>

          <div className="profile-details">
            <div className="detail-item">
              <Mail size={18} className="detail-icon" />
              <div>
                <label>Email Address</label>
                <p>{user.email}</p>
              </div>
            </div>
            <div className="detail-item">
              <User size={18} className="detail-icon" />
              <div>
                <label>Full Name</label>
                <p>{user.name}</p>
              </div>
            </div>
            <div className="detail-item">
              <Shield size={18} className="detail-icon" />
              <div>
                <label>Account Role</label>
                <p style={{ textTransform: 'capitalize' }}>{user.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="card glass-panel password-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div className="password-header" style={{ marginBottom: '1rem', justifyContent: 'center' }}>
            <KeyRound size={32} className="text-gradient" />
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>Account Security</h3>
          <p className="text-muted mb-2">
            Update your password to keep your account secure.
          </p>
          <button className="btn btn-primary" onClick={() => setShowPasswordModal(true)}>
            <KeyRound size={18} /> Change Password
          </button>
        </div>
      </div>

      {showPasswordModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.8rem' }}>
                 <KeyRound size={24} className="text-gradient" />
                 Change Password
               </h2>
               <button onClick={() => setShowPasswordModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                 <X size={24} />
               </button>
            </div>
            
            {message.text && (
              <div className={`alert alert-${message.type}`}>
                {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                {message.text}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="password-form" style={{ maxWidth: '100%' }}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ flex: 1 }}>
                  <Save size={18} /> {isLoading ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
