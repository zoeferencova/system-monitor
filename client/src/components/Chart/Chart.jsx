import React from 'react';

import styles from './Chart.module.scss';

function Chart({ points }) {
    return (
        <div>{points.map((point, i) => {
            const date = new Date(point.timestamp)
            return <div key={point.id}>{date.toTimeString()}</div>
        })}</div>
    );
}

export default Chart;
