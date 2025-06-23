import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './NavBar.module.scss';

import menuIcon from '../../assets/nav_bar_menu.png';
import mainIcon from '../../assets/nav_bar_icon.png';
import profileIcon from '../../assets/nav_bar_profile.png';

const NavBar = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [user, setUser] = useState(null);
    const dropdownRef = useRef();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log("No token found");
                    return;
                }

                const res = await axios.get('http://localhost:5000/api/user/current', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUser(res.data);
            } catch (err) {
                const errorData = err.response?.data;
                const errorMessage = errorData?.message || err.message;

                console.error("Failed to fetch user:", errorMessage);

                if (err.response?.status === 401 && errorMessage.toLowerCase().includes("token expired")) {
                    console.warn("Token expired. Auto-logging out...");
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
            };
        }
        fetchUser();
        }, []);


    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleProfileClick = () => {
        setShowDropdown(prev => {
        return !prev;
        });
  };

    const handleLogout = () => {
        console.log("Logging out...");
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

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

            <div className={styles.nav_bar_profile} ref={dropdownRef}>
                <img
                    id="nav_bar_profile"
                    src={profileIcon}
                    alt="Profile Icon"
                    onClick={handleProfileClick}
                    style={{ cursor: 'pointer' }}
                />
                {showDropdown && user && (
                    <div className={styles.dropdown}>
                        <div className={styles.userName}>Hello, {user.username}</div>
                        <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>
                    </div>
                    )}

            </div>
        </nav>
    );
};

export default NavBar;
