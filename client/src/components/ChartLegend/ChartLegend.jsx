import React from 'react';

import styles from './ChartLegend.module.scss';

function ChartLegend({ selectedMetrics, lineColors, metricLabels }) {
    return (
        <div className={styles.legend}>
            {selectedMetrics.map((metric, i) => (
                <div className={styles.metric} key={metric}>
                    <div className={styles.legendCircle} style={{ background: lineColors[i] + '22', border: '1.5px solid ' + lineColors[i] + 'ff' }}></div>
                    <span>{metricLabels[metric]} CPU %</span>
                </div>
            ))}
        </div>
    );
}

export default ChartLegend;
