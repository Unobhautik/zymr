import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { userService } from './services/api';
import Dashboard from './components/Dashboard';
import UserList from './components/UserList';
import UserDetail from './components/UserDetail';
import './App.css';

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/users', label: 'Users' }
  ];

  return (
    <nav className="nav">
      <div className="nav-brand">
        <h2>User Dashboard</h2>
      </div>
      <div className="nav-links">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const userData = await userService.getAllUsers();
        setUsers(userData);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUserUpdate = (updatedUser) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      )
    );
  };

  const handleUserCreate = (newUser) => {
    setUsers(prevUsers => [newUser, ...prevUsers]);
  };

  const handleUserDelete = (userId) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-container">
          <h2>Oops! Something went wrong</h2>
          <p className="error">{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={<Dashboard users={users} />} 
            />
            <Route 
              path="/users" 
              element={
                <UserList 
                  users={users} 
                  onUserUpdate={handleUserUpdate}
                  onUserCreate={handleUserCreate}
                  onUserDelete={handleUserDelete}
                />
              } 
            />
            <Route 
              path="/users/:id" 
              element={
                <UserDetail 
                  users={users}
                  onUserUpdate={handleUserUpdate}
                />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
