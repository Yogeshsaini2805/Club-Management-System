import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, KeyRound, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from '../components/common/Modal';
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
      setMessage({ text: 'Unable to connect to backend server. Make sure Python FastAPI is running.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container profile-page">
      <div className="profile-bg-shape-1"></div>
      <div className="profile-bg-shape-2"></div>
      
      <div className="profile-header-section">
        <h1 className="section-title profile-page-title">My Profile</h1>
        <p className="section-subtitle profile-page-subtitle">Manage your account details and security settings.</p>
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
        <div className="card glass-panel password-card">
          <div className="password-header">
            <KeyRound size={32} className="text-gradient" />
          </div>
          <h3>Account Security</h3>
          <p className="text-muted mb-2">
            Update your password to keep your account secure.
          </p>
          <button className="btn btn-primary" onClick={() => setShowPasswordModal(true)}>
            <KeyRound size={18} /> Change Password
          </button>
        </div>
      </div>

      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setMessage({ text: '', type: '' });
        }}
        title="Change Password"
        maxWidth="500px"
      >
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="password-form">
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

          <div className="password-form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              <Save size={18} /> {isLoading ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
