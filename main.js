(function() {
    var interactiveElements = document.getElementsByClassName("interactive");
    for (var i = 0; i < interactiveElements.length; i++) {
        var interactiveElement = interactiveElements[i];
        loadInteractiveElement(interactiveElement);
    }
    
    function loadInteractiveElement(interactiveElement) {
        var initialEquation = {a: 2, b: 4};
        
        useEquation(interactiveElement, initialEquation);
        
        interactiveElement.querySelector(".action").addEventListener("click", function() {
            useEquation(interactiveElement, randomEquation());
        }, true);
    }
    
    function randomEquation() {
        return {a: getRandomInt(-10, 10), b: getRandomInt(-10, 10)};
    }
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    function useEquation(interactiveElement, equation) {
        displayEquation(interactiveElement.querySelector("*[data-display='equation']"), equation);
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, interactiveElement]);
        
        var graphElement = interactiveElement.querySelector(".graph");
        
        plotEquation(graphElement, function(x) {
            return equation.a * x + equation.b;
        });
    }
    
    function displayEquation(element, equation) {
        // TODO: escape
        element.innerHTML = "$$ y = " + termsToLatex(equation) + " $$";
    }
    
    function termsToLatex(terms) {
        var a = termToLatex({value: terms.a, suffix: "x", isFirst: true});
        var b = termToLatex({value: terms.b});
        
        if (!a && !b) {
            return "0";
        } else {
            return [a, b].join(" ");
        }
    }
    
    function termToLatex(options) {
        if (options.value === 0) {
            return;
        } else {
            var prefix = options.value > 0 && !options.isFirst ? "+" : "";
            var value = options.suffix && options.value === 1 ? "" : options.value + "";
            var suffix = options.suffix || "";
            return [prefix, value, suffix].join(" ");
        }
    }
    
    function plotEquation(containerElement, equation) {
        var graphElement = interactiveElement.querySelector(".graph");
        
        var data = [];
        for (var x = -50; x <= 50; x += 0.1) {
            var y = equation(x);
            data.push({x: x, y: y});
        }
        
        plotLineGraph(containerElement, data);
    }
    
    function plotLineGraph(containerElement, data) {
        removeNode(containerElement.querySelector("svg"));
        
        var margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = 600 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;

        var parseDate = d3.time.format("%d-%b-%y").parse;

        var x = d3.scale.linear()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .x(function(point) { return x(point.x); })
            .y(function(point) { return y(point.y); });

        var svg = d3.select(containerElement).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        // Make sure that we include the origin
        var visiblePoints = data.slice(0);
        visiblePoints.push({x: 0, y: 0});
        
        //~ x.domain(d3.extent(visiblePoints, function(d) { return d.x; }));
        //~ y.domain(d3.extent(visiblePoints, function(d) { return d.y; }));
        x.domain([-50, 50]);
        y.domain([-50, 50]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, " + y(0) + ")")
            .call(xAxis);

        // TODO: fix up axis labels

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + x(0) + ", 0)")
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("y");

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);
    }
    
    function removeNode(node) {
        if (node) {
            node.parentElement.removeChild(node);
        }
    }
})();
