import './App.css';
import React, { useState } from 'react';
import { useQuery, gql, useSubscription } from '@apollo/client';
import Chart from './components/Chart';

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

const UPDATE_DATA = gql`
  subscription SystemData {
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

  const { loading, error, data } = useQuery(GET_DATA, {
    pollInterval: 5000,
    onCompleted: data => updatePoints([...points, data.systemData])
  })

  // const { subData } = useSubscription(UPDATE_DATA, {
  //   onData: data => updatePoints([...points, data.data.data.systemData])
  // })

  if (loading) return <p>Loading...</p>
  if (error) console.log(error)

  return (
    <>
      <Chart points={points} />
    </>

  );
}

export default App;
