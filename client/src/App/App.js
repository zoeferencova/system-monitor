import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import Header from '../components/Header/Header';
import Widgets from '../components/Widgets/Widgets';
import Chart from '../components/Chart/Chart';
import ProcessTable from '../components/ProcessTable/ProcessTable';

import styles from './App.module.scss';

const GET_DATA = gql`
  query SystemData {
    systemData {
      id
      cpuTotal
      battCharging
      battCycles
      battPercent
      battRemaining
      cpuSys
      cpuUser
      memFree
      memUsed
      processes {
        cpu
        mem
        name
        started
      }
      timestamp
      deviceID
    }
  }
`;

function App() {
  const [points, updatePoints] = useState([])

  const addPoint = data => {
    if (points.length >= 300) points.shift()
    updatePoints([...points, data.systemData])
  }

  const { loading, error, data } = useQuery(GET_DATA, {
    pollInterval: 1000,
    onCompleted: data => addPoint(data)
  })

  if (loading) return <p>Loading...</p>
  if (error) console.log(error)

  return (
    <div className={styles.app} >
      <div className={styles.container}>
        <Header />
        <Widgets currentPoint={points[points.length - 1]} />
        <Chart data={points} />
        <ProcessTable processes={points[points.length - 1].processes} />
      </div>
    </div>

  );
}

export default App;
