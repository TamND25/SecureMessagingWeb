import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import HomePage from './pages/HomePage/HomePage.js';
import Login from './pages/Login/Login.js'
import Register from './pages/Register/Register.js';
import PrivateRoute from './components/PrivateRoute/PrivateRoute.js';
import PublicRoute from './components/PrivateRoute/PublicRoute.js';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="*" element={<Navigate to="/login"/>} />
        <Route path="/login" element={
                  <PublicRoute>
                      <Login />
                  </PublicRoute>
              } />

        <Route path="/register" element={
                  <PublicRoute>
                      <Register />
                  </PublicRoute>
              } />

        <Route path="/home" element={
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              } />
              
      </Routes>
    </Router>
  );
}

export default App;
