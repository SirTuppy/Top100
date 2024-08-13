import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      console.error('Error logging in:', error);
      toast.error(`Login failed: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleLogin} className="auth-form">
      <h2>Login</h2>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <div className="password-input">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="toggle-password"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      <button type="submit" className="auth-button">Login</button>
    </form>
  );
}

export default Login;