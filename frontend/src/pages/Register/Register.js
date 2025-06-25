import React, { useState } from 'react';
import styles from './Register.module.scss';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import loginImage from '../../assets/login_image.png';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        email,
        username,
        password,
      });

      console.log("Registered:", response.data);
      navigate('/login');
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles["left-form"]}>
        <div className={styles.welcome}>Welcome!</div>
        <div className={styles.header}>
          <div className={styles.text}>Sign up to</div>
        </div>

        <div className={styles.inputs}>
          <div className={styles.input}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.input}>
            <input
              type="text"
              placeholder="Enter your user name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className={styles.input}>
            <input
              type="password"
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className={styles.input}>
            <input
              type="password"
              placeholder="Confirm your Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.submit_container}>
          <button className={styles.submit} onClick={handleRegister}>
            Register
          </button>
        </div>

        <div className={styles.login}>
          Already have an Account?{' '}
          <span onClick={() => navigate('/login')}>Login</span>
        </div>
      </div>

      <div className={styles["right-image"]}>
        <img src={loginImage} alt="Register illustration" />
      </div>
    </div>
  );
};

export default Register;
