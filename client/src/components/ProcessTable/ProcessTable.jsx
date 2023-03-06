import React from 'react';
import SectionHeader from '../SectionHeader/SectionHeader';

import styles from './ProcessTable.module.scss';

function ProcessTable({ processes }) {

    const formatTime = timeStarted => {
        const timeBetween = Date.now() - new Date(timeStarted)
        console.log(timeBetween)
        return new Date(timeBetween).toTimeString().split(' ')[0]
    }

    return (
        <div className={styles.section}>
            <SectionHeader heading='Top processes' subheading='By % of total CPU load' />
            <div className={styles.table}>
                <table>
                    <thead>
                        <tr>
                            <td>Name</td>
                            <td>% CPU</td>
                            <td>% Memory</td>
                            <td>CPU Time</td>
                        </tr>
                    </thead>
                    <tbody>
                        {processes.map((process, i) => {
                            return (
                                <tr key={process.name + i}>
                                    <td>{process.name}</td>
                                    <td>{process.cpu.toFixed(1)}</td>
                                    <td>{process.mem.toFixed(1)}</td>
                                    <td>{formatTime(process.started)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ProcessTable;
