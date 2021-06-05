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
// Create object containing x-axis and y-axis labels
var xAxisLabels = {
    poverty: "In Poverty (%)",
    age: "Age (Median)",
    income: "Household Income (Median)"
};
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
        .domain([d3.min(data, d => d[chosenY]) * 0.9,
        d3.max(data, d => d[chosenY]) * 1.1])
        .range([height, 0]);
    return yLinearScale;
};

//------------------------------
// function used for updating x-axis and y-axis var upon click on axis label
function renderAxesX(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function renderAxesY(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

//------------------------------
// function used for updating "location" of circles group 
// with a transition to new circles location
function renderCirclesX(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

function renderCirclesY(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

//------------------------------
// function used for updating "location" of circles group 
// with a transition to new circles location
function renderTextX(circlesText, newXScale, chosenXAxis) {

    circlesText.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]));

    return circlesText;
}

function renderTextY(circlesText, newYScale, chosenYAxis) {

    circlesText.transition()
        .duration(1000)
        .attr("y", d => newYScale(d[chosenYAxis]));

    return circlesText;
}


//------------------------------
// function used for creating and updating tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circlesText) {

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>${xAxisLabels[chosenXAxis]}: ${d[chosenXAxis]}<br>${yAxisLabels[chosenYAxis]}: ${d[chosenYAxis]}`);
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

    circlesText.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });


    return circlesGroup, circlesText;
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
    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
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

    // Create Text Abbreviations of States over Circles
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

    // Create svg group for x-axis and y-axis labels
    xLabelsGroup = chartGroup.append("g")
        .attr("id", "xLabelsGroup");
    yLabelsGroup = chartGroup.append("g")
        .attr("id", "yLabelsGroup");

    // Create x-axes labels
    for (i = 0; i < Object.keys(xAxisLabels).length; i++) {
        var xKeys = Object.keys(xAxisLabels);
        var xValues = Object.values(xAxisLabels);
        // Add the class "active" to the chosen X axis
        var xStatus = "";
        if (xKeys[i] === chosenXAxis) {
            xStatus = "active";
        } else {
            xStatus = "inactive";
        }
        // Append all x-axes to the html
        xLabelsGroup.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 20 + (20 * i)})`)
            .classed("aText", true)
            .classed(xStatus, true)
            .attr("value", xKeys[i])
            .text(xValues[i]);
    };

    // Create y-axes labels
    for (i = 0; i < Object.keys(yAxisLabels).length; i++) {
        var yKeys = Object.keys(yAxisLabels);
        var yValues = Object.values(yAxisLabels);
        // Add the class "active" to the chosen Y axis
        var yStatus = "";
        if (yKeys[i] === chosenYAxis) {
            yStatus = "active";
        } else {
            yStatus = "inactive";
        }
        // Append all y-axes to the html    
        yLabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 + margin.left - (20 * i) - 135)
            .attr("x", 0 - (height / 2))
            .classed("aText", true)
            .classed(yStatus, true)
            .attr("value", yKeys[i])
            .text(yValues[i]);
    };

    // Initialize tool tip
    var toolTip = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circlesText);

    var xText = d3.select("#xLabelsGroup").selectAll(".aText");
    var yText = d3.select("#yLabelsGroup").selectAll(".aText");

    // Listen for on click event and 
    // dynamic change of plot, axis and labels on the x axis
    xText.on("click", function (data) {
        var value = d3.select(this).attr("value");
        console.log(`This value: ${value}, compared with current value: ${chosenXAxis}`);

        // Clear previously active axis label and make clicked label as active
        if (d3.selectAll(".active")) {
            var activeText = d3.select("#xLabelsGroup").selectAll(".active");
            console.log(activeText);
            activeText
                .classed("active", false)
                .classed("inactive", true);
        }
        data = d3.select(this);
        data
            .classed("active", true)
            .classed("inactive", false);

        if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            // console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinScale = xScale(stateData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderAxesX(xLinScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCirclesX(circlesGroup, xLinScale, chosenXAxis);

            circlesText = renderTextX(circlesText, xLinScale, chosenXAxis);

            // updates tooltips with new info
            toolTip = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circlesText);
        }
    });

    // Listen for on click event and 
    // dynamic change of plot, axis and labels on the x axis
    yText.on("click", function (data) {
        var value = d3.select(this).attr("value");
        console.log(`This value: ${value}, compared with current value: ${chosenYAxis}`);

        // Clear previously active axis label and make clicked label as active
        if (d3.selectAll(".active")) {
            var activeText = d3.select("#yLabelsGroup").selectAll(".active");
            console.log(activeText);
            activeText
                .classed("active", false)
                .classed("inactive", true);
        }
        data = d3.select(this);
        data
            .classed("active", true)
            .classed("inactive", false);

        if (value !== chosenYAxis) {

            // replaces chosenYAxis with value
            chosenYAxis = value;

            // console.log(chosenYAxis)

            // functions here found above csv import
            // updates y scale for new data
            yLinScale = yScale(stateData, chosenYAxis);

            // updates y axis with transition
            yAxis = renderAxesY(yLinScale, yAxis);

            // updates circles with new y values
            circlesGroup = renderCirclesY(circlesGroup, yLinScale, chosenYAxis);

            circlesText = renderTextY(circlesText, yLinScale, chosenYAxis);

            // updates tooltips with new info
            toolTip = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circlesText);
        }
    });

}).catch(function (error) {
    console.log(error);
});
