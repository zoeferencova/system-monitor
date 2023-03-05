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

    return (
        <div className={styles.widgets}>
            <Widget primaryStat={cpuTotal.toFixed(1) + '%'} secondaryStats={{ System: cpuSys.toFixed(1) + '%', User: cpuUser.toFixed(1) + '%' }} category="CPU" />
            <Widget primaryStat={memTotal.toFixed(1) + '%'} secondaryStats={{ Usage: formatBytes(memUsed), Free: formatBytes(memFree) }} category="Memory" />
            <Widget primaryStat={battPercent + '%'} secondaryStats={{ 'Time left': battRemaining + ' mins', Cycles: battCycles }} charging={battCharging} category="Battery" />
        </div>
    );
}

export default Widgets;
