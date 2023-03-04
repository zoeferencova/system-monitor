import React from 'react';
import Widget from '../Widget/Widget';

import styles from './Widgets.module.scss';


function Widgets({ currentPoint }) {
    const { cpuTotal, cpuSys, cpuUser, memFree, memUsed, battCycles, battCharging, battPercent, battRemaining } = currentPoint;
    const memTotal = (memUsed / (memFree + memUsed)) * 100
    return (
        <div>
            <Widget primaryStat={cpuTotal + '%'} secondaryStats={[cpuSys + '%', cpuUser + '%']} category="CPU" />
            <Widget primaryStat={memTotal + '%'} secondaryStats={[memUsed + 'GB', memFree + 'MB']} category="Memory" />
            <Widget primaryStat={battPercent + '%'} secondaryStats={[battRemaining + ' mins', battCycles]} charging={battCharging} category="Battery" />
        </div>
    );
}

export default Widgets;
