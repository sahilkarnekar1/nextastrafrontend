import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ImageUploader from './ImageUploader';
import './App.css'; // Ensure to import the CSS for styling
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <>
      <Router>
        <header>
          <nav className="navbar">
            <ul className="navbar-list">
              <li className="navbar-item">
                <Link to="/register">Register</Link>
              </li>
              <li className="navbar-item">
                <Link to="/login">Login</Link>
              </li>
              <li className="navbar-item">
                <Link to="/">Home</Link>
              </li>
            </ul>
          </nav>
        </header>

        <Routes>
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ImageUploader />} />
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
