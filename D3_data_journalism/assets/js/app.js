// @TODO: YOUR CODE HERE!
// Global Variables setting the svg dimensions
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
//------------------------------
// Create an SVG wrapper, append an SVG group that will hold the chart, 
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//------------------------------
// Create array of object containing x-axis labels
var xAxisLabels = [{
    poverty: "In Poverty (%)",
    age: "Age (Median)",
    income: "Household Income (Median)"
}];

// Create array of object containing y-axis labels
var yAxisLabels = [{
    healthcare: "Lacks Healthcare (%)",
    smokes: "Smokes (%)",
    obesity: "Obese (%)"
}];

console.log(xAxisLabels);
console.log(yAxisLabels);

//------------------------------
// Set default x-axis and y-axis values to first objects
var chosenXAxis = Object.keys(xAxisLabels[0])[0];
var chosenYAxis = Object.keys(yAxisLabels[0])[0];

console.log(chosenXAxis);
console.log(chosenYAxis);

//------------------------------
// Function to set the x-axis scale (as a linear scale)
function xAxis(data, chosenX) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenX]) * 0.9,
        d3.max(data, d => d[chosenX]) * 1.1])
        .range([0, width]);

    return xLinearScale;
};

// Function to set the y-axis scale (as a linear scale)
function yAxis(data, chosenY) {
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[chosenY]) * 1.1])
        .range([height, 0]);
    return yLinearScale;
};

//------------------------------
// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

//------------------------------
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d}<br>${d} ${d[chosenXAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}

//------------------------------
// Import Data
d3.csv("assets/data/data.csv").then(function (stateData) {

    // Parse Data/Cast as numbers
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

    // Create scale functions
    var xScale = xAxis(stateData, chosenXAxis);
    var yScale = yAxis(stateData, chosenYAxis);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xScale);
    var leftAxis = d3.axisLeft(yScale);

    // Append Axes to the chart
    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    chartGroup.append("g")
        .call(leftAxis);

    // Create Circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xScale(d[chosenXAxis]))
        .attr("cy", d => yScale(d[chosenYAxis]))
        .attr("r", "15");

    var circlesText = chartGroup.selectAll("text.stateText")
        .data(stateData)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xScale(d[chosenXAxis]))
        .attr("y", d => yScale(d[chosenYAxis]))
        .attr("dy", ".25em")
        .text(function (d) {
            return d.abbr;
        });

    // Step 6: Initialize tool tip
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>In Poverty: ${d.poverty}<br>Lacks Healthcare: ${d.healthcare}`);
        });

    // Step 7: Create tooltip in the chart
    chartGroup.call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    // Create y-axes labels
    yAxisLabels.forEach((d, i) => {
        Object.entries(d).forEach(([key, value]) => {
            console.log(key, value);
            chartGroup.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left + 35 + (20 * [i]))
                .attr("x", 0 - (height / 2))
                .attr("class", "aText")
                .attr("value", key)
                .text(value);
        });
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
        this.append("text").classed("aText active", true);
    });

}).catch(function (error) {
    console.log(error);
});