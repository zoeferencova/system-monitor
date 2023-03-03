import { InfluxDB, Point, HttpError } from '@influxdata/influxdb-client'
import { OrgsAPI, BucketsAPI } from '@influxdata/influxdb-client-apis'

import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' });
const { INFLUX_URL, INFLUX_TOKEN, INFLUX_ORG, INFLUX_BUCKET } = process.env

const influxDB = new InfluxDB({ INFLUX_URL, INFLUX_TOKEN })
const writeApi = influxDB.getWriteApi(INFLUX_ORG, INFLUX_BUCKET)
const queryApi = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN }).getQueryApi(INFLUX_ORG)


// WRITE ROW
const point = new Point('temperature')
  .tag('sensor_id', 'TLM010')
  .floatField('value', 24)

writeApi.writePoint(point)

writeApi.close().then(() => {
  console.log('WRITE FINISHED')
})


// READ QUERY
const fluxQuery =
  'from(bucket:"system_monitor") |> range(start: -1d) |> filter(fn: (r) => r._measurement == "temperature")'

// ITERATE THROUGH ALL ROWS
async function iterateRows() {
  console.log('*** IterateRows ***')
  for await (const { values, tableMeta } of queryApi.iterateRows(fluxQuery)) {
    const o = tableMeta.toObject(values)
    console.log(
      `${o._time} ${o._measurement} in '${o.location}' (${o.example}): ${o._field}=${o._value}`
    )

    // alternatively, you can get only a specific column value without
    // the need to create an object for every row
    // console.log(tableMeta.get(row, '_time'))
  }
  console.log('\nIterateRows SUCCESS')
}

iterateRows()


// DELETE AND RECREATE BUCKET

// async function recreateBucket(name) {
//   console.log('*** Get organization by name ***')
//   const orgsAPI = new OrgsAPI(influxDB)
//   const organizations = await orgsAPI.getOrgs({ INFLUX_ORG })
//   if (!organizations || !organizations.orgs || !organizations.orgs.length) {
//     console.error(`No organization named "${INFLUX_ORG}" found!`)
//   }
//   const orgID = organizations.orgs[0].id
//   console.log(`Using organization "${INFLUX_ORG}" identified by "${orgID}"`)

//   console.log('*** Get buckets by name ***')
//   const bucketsAPI = new BucketsAPI(influxDB)
//   try {
//     const buckets = await bucketsAPI.getBuckets({ orgID, name })
//     if (buckets && buckets.buckets && buckets.buckets.length) {
//       console.log(`Bucket named "${name}" already exists"`)
//       const bucketID = buckets.buckets[0].id
//       console.log(`*** Delete Bucket "${name}" identified by "${bucketID}" ***`)
//       await bucketsAPI.deleteBucketsID({ bucketID })
//     }
//   } catch (e) {
//     if (e instanceof HttpError && e.statusCode == 404) {
//       // OK, bucket not found
//     } else {
//       throw e
//     }
//   }

//   console.log(`*** Create Bucket "${name}" ***`)
//   // creates a bucket, entity properties are specified in the "body" property
//   const bucket = await bucketsAPI.postBuckets({ body: { orgID, name } })
//   console.log(
//     JSON.stringify(
//       bucket,
//       (key, value) => (key === 'links' ? undefined : value),
//       2
//     )
//   )
// }

// try {
//   await recreateBucket('system_monitor')
//   console.log('\nFinished SUCCESS')
// } catch (e) {
//   console.error(e)
//   console.log('\nFinished ERROR')
// }


