import { useEffect, useRef } from 'react'
import { select, extent, scaleTime, scaleLinear, axisLeft, axisBottom, timeFormat, timeSecond, line, transition, easeLinear } from 'd3';

import styles from './Chart.module.scss'

// margin convention often used with D3
const margin = { top: 80, right: 60, bottom: 80, left: 60 }
const width = 1000 - margin.left - margin.right
const height = 400 - margin.top - margin.bottom

const Chart = ({ data }) => {
    const d3svg = useRef(null)

    // scales
    const xValue = d => new Date(d.timestamp);
    const xScale = scaleTime()
        .domain([timeSecond.offset(new Date(xValue(data[data.length - 1])), -300), new Date(xValue(data[data.length - 1]))])
        .range([0, width])

    const yValue = d => d.cpuTotal
    const yScale = scaleLinear()
        .domain([0, 100])
        .range([height, 0])

    const xAxis = axisBottom(xScale).ticks(5).tickFormat(timeFormat("%-I:%M%p"))
    const yAxis = axisLeft(yScale).ticks(4)

    var cpuLine = line()
        .x(d => xScale(xValue(d)))
        .y(d => yScale(yValue(d)))

    const createGraph = () => {
        let svg = select(d3svg.current);

        svg = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`)

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .classed("x-axis", true)
            .call(xAxis);

        svg.append("g")
            .classed("y-axis", true)
            .call(yAxis);

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", 1.5)
            .attr("d", cpuLine)


    }

    const updateGraph = () => {
        let line = select('.line')


        line
            .datum(data)
            .attr("d", cpuLine)

        const xAxisGroup = select('.x-axis')

        xAxisGroup
            .transition()
            .duration(1000)
            .ease(easeLinear)
            .call(xAxis);
    }

    useEffect(() => {
        createGraph()
    }, [])

    useEffect(() => {
        updateGraph()
        console.log(data)
    }, [data])

    return (
        <svg
            className={styles.container}
            width={width + margin.left + margin.right}
            height={height + margin.top + margin.bottom}
            role="img"
            ref={d3svg}
        ></svg>
    )
}

export default Chart;

// var svg = select(d3svg.current),
//                 margin = { top: 20, right: 20, bottom: 20, left: 40 },
//                 width = +svg.attr("width") - margin.left - margin.right,
//                 height = +svg.attr("height") - margin.top - margin.bottom,
//                 g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//             const xValue = d => new Date(d.timestamp);
//             const x = scaleTime()
//                 .domain(extent(data, xValue))
//                 .range([0, width])

//             const yValue = d => d.cpuTotal
//             const y = scaleLinear()
//                 .domain(extent(data, yValue))
//                 .range([height, 0])

//             var myLine = line()
//                 .x(function (d, i) { return x(i); })
//                 .y(function (d, i) { return y(d); });

//             g.append("defs").append("clipPath")
//                 .attr("id", "clip")
//                 .append("rect")
//                 .attr("width", width)
//                 .attr("height", height);

//             g.append("g")
//                 .attr("class", "axis axis--x")
//                 .attr("transform", "translate(0," + y(0) + ")")
//                 .call(axisBottom(x));

//             g.append("g")
//                 .attr("class", "axis axis--y")
//                 .call(axisLeft(y));

//             // g.append("g")
//             //     .attr("clip-path", "url(#clip)")
//             //     .append("path")
//             //     .datum(data[data.length - 1])
//             //     .attr("class", "line")
//             //     .transition()
//             //     .duration(500)
//             //     .ease(easeLinear)
//             //     .on("start", tick);

//             function tick() {

//                 // Redraw the line.
//                 select(this)
//                     .attr("d", myLine)
//                     .attr("transform", null);

//                 // Slide it to the left.
//                 active(this)
//                     .attr("transform", "translate(" + x(-1) + ",0)")
//                     .transition()
//                     .on("start", tick);

//                 // Pop the old data point off the front.
//                 data.shift();

//             }




// useEffect(() => {
//     if (data && d3svg.current) {
//         let svg = select(d3svg.current)

//         // append group translated to chart area
//         svg = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`).classed('chart-group', true).attr('width', width).attr('height', height)

//         // draw axes

//         svg
//             .append('g')
//             .attr('class', 'x-axis')
//             .attr('transform', `translate(0,${height + margin.bottom / 3})`)
//             .call(xAxis)

//         svg
//             .append('g')
//             .attr('class', 'y-axis')
//             .attr('transform', `translate(${-margin.left / 3},0)`)
//             .call(yAxis)
//     }
// }, [])

// useEffect(() => {
//     // draw dots
//     const svg = select('.chart-group')
//     svg
//         // .selectAll('.point')
//         // .data(point)
//         // .enter()
//         .append('circle')
//         .attr('class', 'point')
//         .attr('cy', yScale(yValue(point)))
//         .attr('cx', xScale(xValue(point)))
//         .attr('r', '4px')
//         .style('fill', 'black')

//     const x = select('.x-axis')
//     x.call(xAxis)

//     const y = select('.y-axis')
//     y.call(yAxis)

// }, [point])
