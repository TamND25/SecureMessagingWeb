import React from 'react';
import styles from './NavBar.module.scss';

import menuIcon from '../../assets/nav_bar_menu.png';
import mainIcon from '../../assets/nav_bar_icon.png';
import profileIcon from '../../assets/nav_bar_profile.png';

const NavBar = () => {
    return (
        <nav className={styles.navbar}>
            <div className={styles.nav_bar_menu}>
                <img id="nav_bar_menu" src={menuIcon} alt="Menu Icon" />
            </div>

            <div className={styles.nav_bar_icon}>
                <img id="nav_bar_icon" src={mainIcon} alt="Main Icon" />
            </div>

            <ul className={styles.nav_bar_name}>
                <li>Messages</li>
            </ul>

            <div className={styles.nav_bar_profile}>
                <img id="nav_bar_profile" src={profileIcon} alt="Profile Icon" />
            </div>
        </nav>
    );
};

export default NavBar;
