import { useEffect, useRef, useState } from 'react'
import { select, scaleTime, scaleLinear, axisLeft, axisBottom, timeFormat, timeSecond, line, area, easeLinear, pointer, bisector, selectAll, max } from 'd3';
import SectionHeader from '../SectionHeader/SectionHeader';
import styles from './Chart.module.scss'

// margin convention often used with D3
const margin = { top: 20, right: 85, bottom: 30, left: 30 }
const width = 1000 - margin.left - margin.right
const height = 250 - margin.top - margin.bottom

const lineColors = ["#2F58F6", "#6CB477", "#9180FF"];
const axisColor = "#7D8292"
const gridColor = "#D9D9D9"
const tooltipColor = "#404040"

const tooltipPaddingX = 15
const tooltipPaddingY = 10

let tooltipHeight = 0
let tooltipWidth = 0

const metricLabels = {
    'cpuSys': 'System',
    'cpuUser': 'User',
    'cpuTotal': 'Total',
    'memTotal': 'Used',
    'batteryPercent': 'Charge'
}

const Chart = ({ data, formatPercentage, formatBytes }) => {
    const [selectedMetrics, setSelectedMetrics] = useState(['cpuSys', 'cpuUser', 'cpuTotal'])
    const [mousePosition, setMousePosition] = useState(null)

    const d3svg = useRef(null)

    // scales
    const xValue = d => new Date(d.timestamp);
    const xScale = scaleTime()
        .domain([timeSecond.offset(new Date(xValue(data[data.length - 1])), -300), new Date(xValue(data[data.length - 1]))])
        .range([0, width])

    const yScale = scaleLinear()
        .domain([0, 100])
        .range([height, 0])

    const xAxis = axisBottom(xScale).ticks(5).tickFormat(timeFormat("%-I:%M%p")).tickSizeOuter(0)
    const yAxis = axisLeft(yScale).tickValues([0, 25, 50, 75, 100])

    const yAxisGrid = axisLeft(yScale).tickSize(-width).tickFormat("").tickValues([0, 25, 50, 75, 100])

    const createGraph = () => {
        let svg = select(d3svg.current)
            .attr("class", styles.chart)

        svg = svg.append('g')
            .attr('class', styles.chartInner)
            .attr('id', 'chart-inner')
            .attr('transform', `translate(${margin.left}, ${margin.top})`)
            .attr("width", width)
            .attr("height", height)

        svg.append("g")
            .classed("y-axis", true)
            .call(yAxis)
            .attr("color", axisColor)
            .selectAll(".tick line")
            .style('color', 'white')
            .select(".domain").remove()

        svg.append('g')
            .classed("y-axis-grid", true)
            .call(yAxisGrid)
            .attr("color", gridColor)
            .select(".domain")
            .attr("stroke", "white")

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .classed("x-axis", true)
            .call(xAxis)
            .attr("color", axisColor)
            .selectAll("text")
            .attr("dy", "1em")

        svg = svg.append("g")
            .attr("width", width)
            .attr("height", height)
            .attr("clip-path", "url(#clip)")

        svg.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height)

        selectedMetrics.forEach((metric, i) => {
            svg.append("path")
                .datum(data)
                .attr("class", `${metric}-line`)
                .attr("stroke", lineColors[i])
                .attr("fill", "none")
                .attr("stroke-width", 1.5)
                .attr("d", line().x(d => xScale(xValue(d))).y(d => yScale(d[metric])))

            svg.append("path")
                .datum(data)
                .attr("class", `${metric}-area`)
                .attr("fill", lineColors[i])
                .attr("opacity", 0.1)
                .attr("d", area().x(d => xScale(xValue(d))).y0(height).y1(d => yScale(d[metric])))
        })

        const tooltipGroup = svg.append("g")
            .attr("id", "tooltip-group")
            .attr("class", styles.tooltipGroup)

        tooltipGroup.append("line")
            .attr("id", "tooltip-line")
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", tooltipColor)

        tooltipGroup.append("rect")
            .attr("class", styles.tooltip)
            .attr("id", "tooltip")
            .attr("rx", 6)
            .attr("ry", 6)

        const tooltipText = tooltipGroup.append("g")
            .attr("id", "tooltip-text")
            .attr("class", styles.tooltipText)
            .style("background", "blue")

        selectedMetrics.forEach((metric, i) => {
            tooltipGroup.append("circle")
                .attr("class", "tooltip-circle")

            tooltipText.append("text").attr("id", `text-${i}`)
        })

    }

    const updateGraph = () => {
        selectedMetrics.forEach((metric, i) => {
            let metricLine = select(`.${metric}-line`)
            let metricArea = select(`.${metric}-area`)

            metricLine
                .datum(data)
                .attr("d", line().x(d => xScale(xValue(d))).y(d => yScale(d[metric])))

            metricArea
                .datum(data)
                .attr("d", area().x(d => xScale(xValue(d))).y0(height).y1(d => yScale(d[metric])))
        })

        const xAxisGroup = select('.x-axis')
        const yAxisGroup = select('.y-axis')

        xAxisGroup
            .transition()
            .duration(1000)
            .ease(easeLinear)
            .call(xAxis)
            .selectAll("text")
            .attr("dy", "1em")

        yAxisGroup
            .call(yAxis)
    }

    const updateTooltipPosition = function (event) {
        setMousePosition(event)

        const tooltip = select("#tooltip")
        const tooltipLine = select("#tooltip-line")
        const tooltipText = select("#tooltip-text")

        const distanceFromEnd = width - event[0];
        const distanceFromTop = event[1];
        const distanceFromBottom = height - event[1];

        const xPosition = distanceFromEnd >= tooltipWidth + (tooltipPaddingX * 2) + 10 ? event[0] + 10 : event[0] - tooltipWidth - (tooltipPaddingX * 2) - 10;
        let yPosition;

        if (distanceFromTop < tooltipHeight / 2 + tooltipPaddingY) {
            yPosition = event[1]
        } else if (distanceFromBottom < tooltipHeight / 2 + tooltipPaddingY) {
            yPosition = event[1] - tooltipHeight - tooltipPaddingY * 2
        } else {
            yPosition = event[1] - (tooltipPaddingY + tooltipHeight / 2);
        }

        tooltip.attr("transform", `translate(${xPosition}, ${yPosition})`)
        tooltipLine.attr("x1", event[0]).attr("x2", event[0])

        tooltipText
            .attr("transform", `translate(${xPosition + tooltipPaddingX}, ${yPosition + tooltipPaddingY + 11})`)
    }

    function setTooltipValues(mousePos) {
        const tooltipCircles = selectAll(".tooltip-circle")
        const tooltipText = select("#tooltip-text")
        const tooltip = select("#tooltip")


        const date = xScale.invert(mousePos[0])

        const bisectDate = bisector(d => d.timestamp).left;
        const i = bisectDate(data, date);

        if (i > 0) {
            const d0 = data[i - 1]
            const d1 = data[i]
            const nearestPoint = mousePos[0] - d0.timestamp > d1.timestamp - mousePos[0] ? d1 : d0;

            const metricValues = []
            selectedMetrics.forEach(metric => metricValues.push(nearestPoint[metric]))

            tooltipCircles.each(function (d, i) {
                select(this)
                    .attr("visibility", "visible")
                    .attr("cx", mousePos[0])
                    .attr("cy", yScale(metricValues[i]))
                    .attr("r", 3)
                    .attr("fill", lineColors[i])
                    .attr("fill-opacity", 0.9)
            })

            const metricsMap = metricValues.map((val, i) => ({ label: [metricLabels[selectedMetrics[i]]], value: val })).sort((a, b) => b.value - a.value)

            metricsMap.map((obj, i) => {
                tooltipText
                    .select(`#text-${i}`)
                    .attr('dy', `${i * 1.2}em`)
                    .text(`${obj.label}: ${formatPercentage(obj.value)}`)
                    .attr('color', 'black')
            })

            tooltip
                .style("fill", "#05051a")
        } else {
            tooltipCircles.each(function (d, i) {
                select(this)
                    .attr("visibility", "hidden")
            })

            selectedMetrics.map((metric, i) => {
                tooltipText
                    .select(`#text-${i}`)
                    .text("")
            })

            tooltip
                .style("fill", "#ababab")

            tooltipText
                .select("#text-0")
                .text("No data")

        }

        tooltipHeight = tooltipText.node().getBoundingClientRect().height;
        tooltipWidth = tooltipText.node().getBoundingClientRect().width;

        tooltip
            .attr("width", tooltipWidth + tooltipPaddingX * 2)
            .attr("height", tooltipHeight + tooltipPaddingY * 2)

    }

    select('#chart-inner')
        .on('mousemove', function (event) {
            select(this).style("cursor", "crosshair")
            updateTooltipPosition(pointer(event))
            setTooltipValues(pointer(event))
        })

    useEffect(() => {
        createGraph()
    }, [])

    useEffect(() => {
        updateGraph()
        mousePosition && setTooltipValues(mousePosition)
    }, [data])



    return (
        <div className={styles.container}>
            <SectionHeader heading='CPU load' subheading='System CPU load by category' />
            <svg
                width={width + margin.left + margin.right}
                height={height + margin.top + margin.bottom}
                role="img"
                ref={d3svg}
            ></svg>
            {/* <Tooltip /> */}
        </div>

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
//         svg = svg.append('g').attr('transform', `translate(${ margin.left }, ${ margin.top })`).classed('chart-group', true).attr('width', width).attr('height', height)

//         // draw axes

//         svg
//             .append('g')
//             .attr('class', 'x-axis')
//             .attr('transform', `translate(0, ${ height + margin.bottom / 3})`)
//             .call(xAxis)

//         svg
//             .append('g')
//             .attr('class', 'y-axis')
//             .attr('transform', `translate(${- margin.left / 3}, 0)`)
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
