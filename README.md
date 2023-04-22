# System Monitor
Dashboard for live CPU usage, memory, and battery data

Live app: https://system-monitor.vercel.app/

## Summary

Track CPU usage, memory, and battery information on your machine in realtime. Dashboard includes a live chart built with D3 that shows CPU usage across different categories, updating every second. 

## Technologies Used

* React 
* D3 for chart
* Apollo Client + Apollo Server

## Use App Locally

The app demo at the above link currently shows data from the remote server on which the app is stored. In order to view data from your local machine (and see the Battery section function properly), follow the below instructions:

1. Clone repo onto your local machine
2. Navigate to client folder and run `npm install`
3. Navigate to server folder and run `npm install`
4. Navigate to client/src/index.js file
5. Uncomment localhost URI's on lines 13 and 18
6. Comment out the URI's with remote endpoint on lines 12 and 17
7. Run `npm start` while inside the client directory
8. Open a new terminal, navigate to the server directory, and run `npm start`
9. Make sure that the port that the server is running on is the same as the port listed in the index.js file in step 3 above

## To-do

- [ ] Add tests (learn how to test charts showing realtime data)
- [ ] Improve latency when connecting to remote server (updates do not always occur every second)
- [ ] Add dropdown for selecting different stats to display on the chart
- [ ] Allow user to pause and resume chart
- [ ] Allow user to specify timespan or use scrubbing to zoom in on different timeframes
- [ ] Add database (InfluxDB?) to persist user data, need to add login functionality too in that case (or just retrieve data by machine ID?)
- [ ] Keep exploring caching options to improve performance
