import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function ProfilePage() {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <h2>{user.name}</h2>
        <p className="profile-email">{user.email}</p>
        
        <div className="profile-details">
          <div className="detail-item">
            <span className="detail-label">Account Role</span>
            <span className={`role-badge ₹{user.role === 'admin' ? 'role-admin' : 'role-user'}`}>
              {user.role}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Member Since</span>
            <span className="detail-value">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'N/A'}
            </span>
          </div>
        </div>

        <button onClick={logout} className="btn btn-danger">
          Logout
        </button>
      </div>
    </div>
  );
}

export default ProfilePage;
