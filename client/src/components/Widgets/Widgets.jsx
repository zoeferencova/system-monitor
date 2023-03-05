import React from 'react';
import Widget from '../Widget/Widget';

import styles from './Widgets.module.scss';


function Widgets({ currentPoint }) {
    const { cpuTotal, cpuSys, cpuUser, memFree, memUsed, battCycles, battCharging, battPercent, battRemaining } = currentPoint;
    const memTotal = (memUsed / (memFree + memUsed)) * 100;

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes'

        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

        const i = Math.floor(Math.log(bytes) / Math.log(k))

        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    }

    const formatPercentage = (percentage, decimals = 1) => {
        return percentage.toFixed(decimals) + '%'
    }

    return (
        <div className={styles.widgets}>
            <Widget primaryStat={formatPercentage(cpuTotal)} secondaryStats={{ System: formatPercentage(cpuSys), User: formatPercentage(cpuUser) }} category="CPU" />
            <Widget primaryStat={formatPercentage(memTotal)} secondaryStats={{ Usage: formatBytes(memUsed), Free: formatBytes(memFree) }} category="Memory" />
            <Widget primaryStat={formatPercentage(battPercent, 0)} secondaryStats={{ 'Time left': battRemaining + ' mins', Cycles: battCycles }} charging={battCharging} category="Battery" />
        </div>
    );
}

export default Widgets;
