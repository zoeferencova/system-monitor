import React from 'react';

import styles from './Widget.module.scss';

function Widget({ primaryStat, secondaryStats, category, charging }) {
    return (
        <div className={styles.widget}>
            <div className={styles.categoryLabel}>
                <img src={require(`../../images/${category.toLowerCase()}.svg`)} alt={category} />
                <span>{category}</span>
            </div>
            <div className={styles.stats}>
                <div className={styles.primaryStat}>
                    <span>{primaryStat}</span>
                </div>
                <div className={styles.secondaryStats}>
                    {Object.entries(secondaryStats).map(([key, value], i) => (
                        <div key={value + i}>
                            <span>{key}</span>
                            <span>{value}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.primaryStatBar}>

            </div>
        </div>
    );
}

export default Widget;
