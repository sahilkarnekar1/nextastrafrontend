import React, { useState } from 'react';
import axios from "axios";
import { API_BASE_URL } from "../api/api.js";
import './Auth.css';

const RegistrationPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      const resp = await axios.post(`${API_BASE_URL}/register`, { username, password });
      if (resp.status === 200 || resp.status === 201) {
        setSuccessMessage('Registration successful Please Go To Login Page !');
        setUsername('');
        setPassword('');
      } else {
        setError(resp.data?.message || 'Registration failed.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError('An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <div className="auth-container">
      <h1>Register</h1>
      {error && <p className="auth-message error">{error}</p>}
      {successMessage && <p className="auth-message success">{successMessage}</p>}
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

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegistrationPage;
