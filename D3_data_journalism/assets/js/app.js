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
var xAxisLabels = {
    poverty: "In Poverty (%)",
    age: "Age (Median)",
    income: "Household Income (Median)"
};

// Create array of object containing y-axis labels
var yAxisLabels = {
    healthcare: "Lacks Healthcare (%)",
    smokes: "Smokes (%)",
    obesity: "Obese (%)"
};

console.log(xAxisLabels);
console.log(yAxisLabels);

//------------------------------
// Set default x-axis and y-axis values to first objects
var chosenXAxis = Object.keys(xAxisLabels)[0];
var chosenYAxis = Object.keys(yAxisLabels)[0];

console.log(`Starter x axis: ${chosenXAxis}`);
console.log(`Start y axis: ${chosenYAxis}`);

//------------------------------
// Function to set the x-axis scale (as a linear scale)
function xScale(data, chosenX) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenX]) * 0.9,
        d3.max(data, d => d[chosenX]) * 1.1])
        .range([0, width]);

    return xLinearScale;
};

// Function to set the y-axis scale (as a linear scale)
function yScale(data, chosenY) {
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[chosenY]) * 1.1])
        .range([height, 0]);
    return yLinearScale;
};

//------------------------------
// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function renderAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

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
// function used for creating and updating tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>In Poverty: ${d.poverty}<br>Lacks Healthcare: ${d.healthcare}`);
        });

    // Create tooltip in the chart
    chartGroup.call(toolTip);

    // Create event listeners to display and hide the tooltip
    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });
};
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
    var xLinScale = xScale(stateData, chosenXAxis);
    var yLinScale = yScale(stateData, chosenYAxis);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinScale);
    var leftAxis = d3.axisLeft(yLinScale);

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
        .attr("cx", d => xLinScale(d[chosenXAxis]))
        .attr("cy", d => yLinScale(d[chosenYAxis]))
        .attr("r", "15");

    var circlesText = chartGroup.selectAll("text.stateText")
        .data(stateData)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinScale(d[chosenXAxis]))
        .attr("y", d => yLinScale(d[chosenYAxis]))
        .attr("dy", ".25em")
        .text(function (d) {
            return d.abbr;
        });
    // Create x-axes labels
    for (i = 0; i < Object.keys(xAxisLabels).length; i++) {
        var xKeys = Object.keys(xAxisLabels);
        var xValues = Object.values(xAxisLabels);
        chartGroup.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 20 + (20 * i)})`)
            .attr("class", "aText")
            .attr("value", xKeys[i])
            .text(xValues[i]);
    };

    // Create y-axes labels
    for (i = 0; i < Object.keys(yAxisLabels).length; i++) {
        var yKeys = Object.keys(yAxisLabels);
        var yValues = Object.values(yAxisLabels);
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 + margin.left - (20 * i) - 135)
            .attr("x", 0 - (height / 2))
            .attr("class", "aText")
            .attr("value", yKeys[i])
            .text(yValues[i]);
    };
    // Initialize tool tip
    var toolTip = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);




    // var aText = d3.selectAll(".aText");

    // aText.on("click", function (data) {
    //     console.log(this);
    //     this.append("text").classed("aText active", true);
    // });

}).catch(function (error) {
    console.log(error);
});