import React from 'react';
import styles from './Widget.module.scss';

function Widget({ primaryStat, secondaryStats, category, charging }) {
    return (
        <div>
            <div className={styles.categoryLabel}>
                <img src={require(`../../images/${category.toLowerCase()}.svg`)} alt={category} />
                <span>{category}</span>
            </div>
            <p>{primaryStat}</p>
            {secondaryStats.map((stat, i) => <p key={stat + i}>{stat}</p>)}
        </div>
    );
}

export default Widget;
