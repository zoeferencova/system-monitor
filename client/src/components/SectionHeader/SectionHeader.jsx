import React from 'react';

import styles from './SectionHeader.module.scss';

function SectionHeader({ heading, subheading }) {
    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>{heading}</h2>
            <p className={styles.subheading}>{subheading}</p>
        </div>
    );
}

export default SectionHeader;
