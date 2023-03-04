import './App.scss';
import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import Chart from '../components/Chart/Chart';
import Widgets from '../components/Widgets/Widgets';

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
    if (points.length > 720) points.shift()
    updatePoints([...points, data.systemData])
  }

  const { loading, error, data } = useQuery(GET_DATA, {
    pollInterval: 3000,
    onCompleted: data => addPoint(data)
  })

  if (loading) return <p>Loading...</p>
  if (error) console.log(error)

  return (
    <div>
      <Widgets currentPoint={points[points.length - 1]} />
      <Chart points={points} />
    </div>

  );
}

export default App;
