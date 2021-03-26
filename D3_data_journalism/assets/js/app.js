// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 700;

var margin = {
    top: 20,
    right: 40,
    bottom: 120,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

var xAxisLabels = [
    "In Poverty (%)",
    "Age (Median)",
    "Household Income (Median)"
];

var yAxisLabels = [
    "Obese (%)",
    "Smokes (%)",
    "Lacks Healthcare (%)"
];

// Import Data
d3.csv("assets/data/data.csv").then(function (stateData) {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    stateData.forEach(function (data) {
        // x axes
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        // y axes
        data.healthcare = +data.healthcare;
        data.smokes = +data.smokes;
        data.obese = +data.obese;
    });

    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(stateData, d => d.poverty) * 0.9, d3.max(stateData, d => d.poverty) * 1.1])
        .range([0, width]);

    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(stateData, d => d.healthcare) * 1.1])
        .range([height, 0]);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    chartGroup.append("g")
        .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", "15");

    var circlesText = chartGroup.selectAll("text.stateText")
        .data(stateData)
        .enter()
        .append("text")
        .classed("stateText", true)
        .text(function (d) {
            return d.abbr;
        })
        .attr("x", d => xLinearScale(d.poverty))
        .attr("y", d => yLinearScale(d.healthcare))
        .attr("dy", ".25em");

    // Step 6: Initialize tool tip
    // ==============================
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>In Poverty: ${d.poverty}<br>Lacks Healthcare: ${d.healthcare}`);
        });

    // Step 7: Create tooltip in the chart
    // ==============================
    chartGroup.call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    // ==============================
    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    // Create y-axes labels
    yAxisLabels.forEach((d, i) => {
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 35 + (20 * [i]))
            .attr("x", 0 - (height / 2))
            .attr("class", "aText")
            .attr("id", d)
            .text(d);
    });

    // Create x-axes labels
    xAxisLabels.forEach((d, i) => {
        chartGroup.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 20 + (20 * [i])})`)
            .attr("class", "aText")
            .attr("id", d)
            .text(d);
    });

    var aText = d3.selectAll(".aText");

    aText.on("click", function (data) {
        console.log(this);
    });

}).catch(function (error) {
    console.log(error);
});