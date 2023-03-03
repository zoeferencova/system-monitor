import React from 'react';

function Chart({ points }) {

    return (
        <div>{points.map(point => <div>{point.cpuTotal}</div>)}</div>
    );
}

export default Chart;
