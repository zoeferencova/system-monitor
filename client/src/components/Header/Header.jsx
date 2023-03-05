import React from 'react';

import styles from './Header.module.scss';

function Header() {
    return (
        <div className={styles.header}>
            <h1 className={styles.h1}>System Monitor</h1>
            <p className={styles.subheading}>CPU load, memory, battery</p>
        </div>
    );
}

export default Header;
