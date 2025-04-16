import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api/api';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { username, password });
      if (response.status === 200) {
        const token = response.data.token;
        if (token) {
          localStorage.setItem('authToken', token);
          navigate('/');
        } else {
          setError('Login successful, but no token received.');
        }
      } else {
        setError(response.data?.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred during login.');
    }
  };

  return (
    <div className="auth-container">
      <h1>Login</h1>
      {error && <p className="auth-message error">{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
