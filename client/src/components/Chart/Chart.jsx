import { useEffect, useRef, useState } from 'react'
import { select, scaleTime, scaleLinear, axisLeft, axisBottom, timeFormat, timeSecond, line, area, easeLinear, pointer, bisector, selectAll } from 'd3';
import SectionHeader from '../SectionHeader/SectionHeader';
import ChartLegend from '../ChartLegend/ChartLegend';
import styles from './Chart.module.scss';

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

const Chart = ({ data, formatPercentage }) => {

    // for future use when creating metric selector
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

    // axes
    const xAxis = axisBottom(xScale).ticks(5).tickFormat(timeFormat("%-I:%M%p")).tickSizeOuter(0)
    const yAxis = axisLeft(yScale).tickValues([0, 25, 50, 75, 100])

    // gridlines
    const yAxisGrid = axisLeft(yScale).tickSize(-width).tickFormat("").tickValues([0, 25, 50, 75, 100])

    // graph creation on component render
    const createGraph = () => {
        let svg = select(d3svg.current)
            .attr("class", styles.chart)

        // inner chart area including group including axes
        svg = svg.append('g')
            .attr('class', styles.chartInner)
            .attr('id', 'chart-inner')
            .attr('transform', `translate(${margin.left}, ${margin.top})`)
            .attr("width", width)
            .attr("height", height)

        // add y axis
        svg.append("g")
            .classed("y-axis", true)
            .call(yAxis)
            .attr("color", axisColor)
            .selectAll(".tick line")
            .style('color', 'white')
            .select(".domain")
            .style('display', 'none')

        // add y axis grid
        svg.append('g')
            .classed("y-axis-grid", true)
            .call(yAxisGrid)
            .attr("color", gridColor)
            .select(".domain")
            .attr("stroke", "white")

        // add x axis
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .classed("x-axis", true)
            .call(xAxis)
            .attr("color", axisColor)
            .selectAll("text")
            .attr("dy", "1em")

        // add time tooltip over x axis
        svg.append("rect")
            .attr("class", styles.timeTooltip)
            .attr("id", "time-tooltip")
            .attr("rx", 6)
            .attr("ry", 6)

        // add time tooltip group and text
        svg.append("g")
            .attr("id", "time-tooltip-text")
            .attr("class", styles.timeTooltipText)
            .append("text")

        // create new group for chart clip path to contain lines/areas within axes
        svg = svg.append("g")
            .attr("width", width)
            .attr("height", height)
            .attr("clip-path", "url(#clip)")

        // append clip path to inner chart area 
        svg.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height)

        // add line and area for each selected metric (currently default value, may add selector in the future)
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

        // add group for primary stats tooltip
        const tooltipGroup = svg.append("g")
            .attr("id", "tooltip-group")
            .attr("class", styles.tooltipGroup)

        // add vertical line to tooltip group
        tooltipGroup.append("line")
            .attr("id", "tooltip-line")
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", "white")

        // add tooltip rectangle 
        tooltipGroup.append("rect")
            .attr("class", styles.tooltip)
            .attr("id", "tooltip")
            .attr("rx", 6)
            .attr("ry", 6)

        // add tooltip text
        const tooltipText = tooltipGroup.append("g")
            .attr("id", "tooltip-text")
            .attr("class", styles.tooltipText)

        // add metric-specific tooltip elements
        selectedMetrics.forEach((metric, i) => {

            // add circles to lines at current x value for each metric
            tooltipGroup.append("circle")
                .attr("class", "tooltip-circle")

            // add a new text item to tooltip for each metric (for multi-line tooltip)
            tooltipText.append("text")
                .attr("id", `text-${i}`)
        })

    }

    // update lines/areas and axes anytime data array is changed
    const updateGraph = () => {

        // select and update each line and area to reflect updated data array with new value
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

        // update x axis with smooth transition
        const xAxisGroup = select('.x-axis')

        xAxisGroup
            .transition()
            .duration(1000)
            .ease(easeLinear)
            .call(xAxis)
            .selectAll("text")
            .attr("dy", "1em")

        // update y axis if change (uncomment if making y axis depend on data max)
        // const yAxisGroup = select('.y-axis')
        // yAxisGroup
        //     .call(yAxis)
    }

    // calculate tooltip position relative to mouse position
    const calculateTooltipPosition = event => {

        // get mouse distance from perimiter of chart inner area
        const distanceFromEnd = width - event[0];
        const distanceFromTop = event[1];
        const distanceFromBottom = height - event[1];

        // move tooltip to left side if it would get cut off by right chart boundary
        const fullTooltipWidth = tooltipWidth + (tooltipPaddingX * 2)
        const tooltipOffset = 10

        const x = distanceFromEnd >= fullTooltipWidth + tooltipOffset ? event[0] + tooltipOffset : event[0] - fullTooltipWidth - tooltipOffset;

        // move tooltip vertical position center/top/bottom of mouse position based on proximity to upper and lower chart boundaries
        const tooltipCenter = tooltipHeight / 2 + tooltipPaddingY;
        let y;

        if (distanceFromTop < tooltipCenter) {
            y = event[1]
        } else if (distanceFromBottom < tooltipCenter) {
            y = event[1] - tooltipHeight - tooltipPaddingY * 2
        } else {
            y = event[1] - tooltipCenter;
        }

        return [x, y]
    }

    // position tooltip based on mouse position
    const updateTooltipPosition = event => {

        // set mouse position state when mouse moves, so that it can be used by 
        // setTooltipValues function to retrieve corresponding chart values
        // using state here so that tooltip values update if mouse hovers over 
        // dynamic chart area and mouse is not moving (not triggering mousemove event handler)
        setMousePosition(event)

        const tooltip = select("#tooltip")
        const tooltipLine = select("#tooltip-line")
        const tooltipText = select("#tooltip-text")
        const timeTooltip = select("#time-tooltip")
        const timeTooltipText = select('#time-tooltip-text')

        const [xPosition, yPosition] = calculateTooltipPosition(event)

        // set tooltip + time tooltip positioning based on mouse position
        tooltip
            .attr("transform", `translate(${xPosition}, ${yPosition})`)

        tooltipLine
            .attr("x1", event[0])
            .attr("x2", event[0])
            .attr("stroke", tooltipColor)

        tooltipText
            .attr("transform", `translate(${xPosition + tooltipPaddingX}, ${yPosition + tooltipPaddingY + 11})`)

        timeTooltip
            .attr("transform", `translate(${event[0] - 40}, ${height + 8})`)
            .attr("width", 80)
            .attr("height", 22)

        timeTooltipText
            .attr("transform", `translate(${event[0] - 32}, ${height + 23})`)
    }

    // update tooltip values whenever mouse position state changes
    const setTooltipValues = mousePos => {
        const tooltipCircles = selectAll(".tooltip-circle")
        const tooltipText = select("#tooltip-text")
        const tooltip = select("#tooltip")
        const timeTooltipText = select('#time-tooltip-text')

        // get date based on mouse x position and set formatter function
        const date = xScale.invert(mousePos[0])
        const formatTime = timeFormat("%-I:%M:%S%p")

        // add formatted date to time tooltip
        timeTooltipText
            .select('text')
            .text(formatTime(date))

        // get index of closest data point on left side of current date value
        const bisectDate = bisector(d => d.timestamp).left;
        const i = bisectDate(data, date);

        // if index exists
        if (i > 0) {

            // determine if mouse position is closer to data point on left or right side
            const d0 = data[i - 1]
            const d1 = data[i]
            const nearestPoint = mousePos[0] - d0.timestamp > d1.timestamp - mousePos[0] ? d1 : d0;

            // get data point values for each selected metric at nearest point
            const metricValues = []
            selectedMetrics.forEach(metric => metricValues.push(nearestPoint[metric]))

            // create circle along the line for each metric
            tooltipCircles.each(function (d, i) {
                select(this)
                    .attr("visibility", "visible")
                    .attr("cx", mousePos[0])
                    .attr("cy", yScale(metricValues[i]))
                    .attr("r", 3)
                    .attr("fill", lineColors[i])
                    .attr("fill-opacity", 0.9)
            })

            // create object for each metric using label from metricLabels object above
            // sort metrics by value to have them in same order as lines
            const metricsMap = metricValues.map((val, i) => ({ label: [metricLabels[selectedMetrics[i]]], value: val })).sort((a, b) => b.value - a.value)

            // add metric label and value to each tooltipText text element
            metricsMap.map((obj, i) => {
                return tooltipText
                    .select(`#text-${i}`)
                    .attr('dy', `${i * 1.2}em`)
                    .text(`${obj.label}: ${formatPercentage(obj.value)}`)
            })

            // set tooltip fill color if valid data exists for mouse position
            tooltip.style("fill", "#05051a")

            // if there is no data at mouse position
        } else {

            // hide circles 
            tooltipCircles.each(function (d, i) {
                select(this)
                    .attr("visibility", "hidden")
            })

            // remove tooltip text
            selectedMetrics.map((metric, i) => {
                return tooltipText
                    .select(`#text-${i}`)
                    .text("")
            })

            // set tooltip fill color to a lighter graya
            tooltip.style("fill", "#ababab")

            // set tooltip text to "No data"
            tooltipText
                .select("#text-0")
                .text("No data")
        }

        // adjust tooltip height and width based on inner text dimensions
        tooltipHeight = tooltipText.node().getBoundingClientRect().height;
        tooltipWidth = tooltipText.node().getBoundingClientRect().width;

        tooltip
            .attr("width", tooltipWidth + tooltipPaddingX * 2)
            .attr("height", tooltipHeight + tooltipPaddingY * 2)
    }

    const addTooltips = () => {
        select('#chart-inner')
            .on('mousemove', function (event) {
                select(this).style("cursor", "crosshair")
                updateTooltipPosition(pointer(event))
                setTooltipValues(pointer(event))
            })
    }

    addTooltips()

    // create graph when component mounts
    useEffect(() => {
        createGraph()
    }, [])

    // update graph and tooltip values when data updates
    useEffect(() => {
        updateGraph()
        mousePosition && setTooltipValues(mousePosition)
    }, [data])

    return (
        <>
            <div className={styles.container}>
                <SectionHeader heading='CPU load' subheading='System CPU load by category' />
                <svg
                    width={width + margin.left + margin.right}
                    height={height + margin.top + margin.bottom}
                    role="img"
                    ref={d3svg}
                ></svg>
            </div>
            <ChartLegend selectedMetrics={selectedMetrics} metricLabels={metricLabels} lineColors={lineColors} />

        </>



    )
}

export default Chart;