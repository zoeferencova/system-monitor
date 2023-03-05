import React from 'react';

import bolt from '../../images/bolt-solid.svg';
import styles from './Widget.module.scss';

function Widget({ primaryStat, secondaryStats, category, charging }) {
    const chargingLabel = <span className={styles.charging}><img className={styles.bolt} src={bolt} alt='bolt' /> Charging</span>

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
                    {Object.entries(secondaryStats).map(([key, value], i) => {
                        return (
                            <div key={value + i}>
                                <span className={styles.label}>{charging && i === 0 ? '' : key}</span>
                                <span className={styles.value}>{charging && i === 0 ? chargingLabel : value}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className={styles.primaryStatBar}>
                <div style={{ width: primaryStat }} className={styles.inner}>
                </div>
            </div>
        </div>
    );
}

export default Widget;
