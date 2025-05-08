import React, { useState} from 'react';
import styles from './Login.module.scss';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import loginImage from '../../assets/login_image.png';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try     {
            const res = await axios.post('http://localhost:5000/login', {
                username,
                password,
            });

            localStorage.setItem('token', res.data.token);

            navigate('/home');
        }   catch   (err) {
                setError(err.response?.data?.message || 'Login failed');
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles["left-form"]}>
                <div className={styles.welcome}>Welcome!</div>
                <div className={styles.header}>
                <div className={styles.text}>Sign in to</div>
            </div>

            <div className={styles.inputs}>
                <div className={styles.input}>
                    <input 
                        type="text" 
                        placeholder="Enter your user name" 
                        value = {username}
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
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.options}>
                <label>
                    <input type="checkbox" />
                    Remember me
                </label>
                <a href="/register">Forgot Password?</a>
            </div>

            <div className={styles.submit_container}>
                <div className={styles.submit} onClick={handleLogin}>Login</div>
            </div>

            <div className={styles.register}>
                Don't have an Account?{' '}
                <span onClick={() => navigate('/register')}>Register</span>
            </div>
            </div>

            <div className={styles["right-image"]}>
                <img src={loginImage} alt="Login illustration" />
            </div>
        </div>
  );
};

export default Login;