import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Water from './pages/Water';
import Calories from './pages/Calories';
import History from './pages/History';
import Profile from './pages/Profile';
import Stats from './pages/Stats';
import Measurements from './pages/Measurements';
import './App.css';

function App() {
    const isAuthenticated = () => {
        const token = localStorage.getItem('token');
        return token !== null && token !== undefined;
    };

    return (
        <Router>
            <Routes>
                <Route path="/login" element={!isAuthenticated() ? <Login /> : <Navigate to="/dashboard" />} />
                <Route path="/register" element={!isAuthenticated() ? <Register /> : <Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />} />
                <Route path="/water" element={isAuthenticated() ? <Water /> : <Navigate to="/login" />} />
                <Route path="/calories" element={isAuthenticated() ? <Calories /> : <Navigate to="/login" />} />
                <Route path="/history" element={isAuthenticated() ? <History /> : <Navigate to="/login" />} />
                <Route path="/profile" element={isAuthenticated() ? <Profile /> : <Navigate to="/login" />} />
                <Route path="/stats" element={isAuthenticated() ? <Stats /> : <Navigate to="/login" />} />
                <Route path="/measurements" element={isAuthenticated() ? <Measurements /> : <Navigate to="/login" />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
        </Router>
    );
}

export default App;