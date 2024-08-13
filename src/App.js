import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import Signup from './components/Signup';
import Login from './components/Login';
import MainList from './components/MainList';
import MyLists from './components/MyLists';
import PublicLists from './components/PublicLists';
import CreateList from './components/CreateList';
import ViewList from './components/ViewList';
import Navbar from './components/Navbar';
import './App.css';
import './DarkMode.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<MainList />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/my-lists" element={<PrivateRoute><MyLists /></PrivateRoute>} />
            <Route path="/public-lists" element={<PublicLists />} />
            <Route path="/create-list" element={<PrivateRoute><CreateList /></PrivateRoute>} />
            <Route path="/edit-list/:listId" element={<PrivateRoute><CreateList /></PrivateRoute>} />
            <Route path="/list/:listId" element={<ViewList />} />
          </Routes>
          <ToastContainer />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;