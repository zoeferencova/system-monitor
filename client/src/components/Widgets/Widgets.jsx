import React from 'react';
import Widget from '../Widget/Widget';

import styles from './Widgets.module.scss';


function Widgets({ currentPoint, formatPercentage, formatBytes }) {
    const { cpuTotal, cpuSys, cpuUser, memFree, memUsed, battCycles, battCharging, battPercent, battRemaining } = currentPoint;
    const memTotal = (memUsed / (memFree + memUsed)) * 100;

    return (
        <div className={styles.widgets}>
            <Widget primaryStat={formatPercentage(cpuTotal)} secondaryStats={{ System: formatPercentage(cpuSys), User: formatPercentage(cpuUser) }} category="CPU" />
            <Widget primaryStat={formatPercentage(memTotal)} secondaryStats={{ Usage: formatBytes(memUsed), Free: formatBytes(memFree) }} category="Memory" />
            <Widget primaryStat={formatPercentage(battPercent, 0)} secondaryStats={{ 'Time left': battRemaining + ' mins', Cycles: battCycles }} charging={battCharging} category="Battery" />
        </div>
    );
}

export default Widgets;
