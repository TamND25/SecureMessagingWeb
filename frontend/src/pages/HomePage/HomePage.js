import React from 'react';
import styles from './HomePage.module.scss'
import Navbar from '../../components/NavBar/NavBar.js';

const HomePage = () => {
    return (
        <div className={styles.container}>
            <Navbar />
        </div>
    );
};

export default HomePage;