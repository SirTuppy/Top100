import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'react-toastify';
import { FaSun, FaMoon } from 'react-icons/fa'; // Import icons
import { useTheme } from '../ThemeContext'; // Import useTheme hook
import './Navbar.css';

function Navbar() {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme(); // Use the theme context

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully!');
    } catch (error) {
      toast.error('Failed to sign out. Please try again.');
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">Boulder100</Link>
      <div className="nav-links">
        <Link to="/">Main List</Link>
        <Link to="/public-lists">Public Lists</Link>
        {user ? (
          <>
            <Link to="/my-lists">My Lists</Link>
            <button onClick={handleSignOut} className="sign-out-button">Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
        <button onClick={toggleTheme} className="theme-toggle-button">
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;