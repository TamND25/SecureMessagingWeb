import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from "react";
import styles from './App.module.scss'

import HomePage from './pages/HomePage/HomePage.js';
import Login from './pages/Login/Login.js'
import Register from './pages/Register/Register.js';
import PrivateRoute from './components/PrivateRoute/PrivateRoute.js';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="*" element={<Navigate to="/login"/>} />
        <Route exact path="/login" element={<Login />}></Route>
        <Route exact path="/register" element={<Register />} />
        <Route
          path="/home" 
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          } />
      </Routes>
    </Router>
  );
}

export default App;
