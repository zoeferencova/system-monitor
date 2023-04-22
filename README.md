# System Monitor
Dashboard for live CPU usage, memory, and battery data

Live app: https://system-monitor.vercel.app/

## Summary

Track CPU usage, memory, and battery information on your machine in realtime. Dashboard includes a live chart built with D3 that shows CPU usage across different categories, updating every second. 

## Technologies Used

* React 
* D3 for chart
* Apollo Client + Apollo Server

## To-do

- [ ] Add tests (learn how to test charts showing realtime data)
- [ ] Improve latency when connecting to remote server (updates do not always occur every second)
- [ ] Add dropdown for selecting different stats to display on the chart
- [ ] Allow user to pause and resume chart
- [ ] Allow user to specify timespan or use scrubbing to zoom in on different timeframes
- [ ] Add database (InfluxDB?) to persist user data, need to add login functionality too in that case (or just retrieve data by machine ID?)
- [ ] Keep exploring caching options to improve performance
