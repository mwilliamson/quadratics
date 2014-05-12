(function() {
    var graphs = {
        "single-linear-equation": {
            highestPower: 1,
            initialEquation: {coefficients: [4, 2]}
        },
        "single-quadratic-equation": {
            highestPower: 2,
            initialEquation: {coefficients: [-10, 3, 1]}
        }
    };
    
    var coefficientSelection = [
        -10, -9, -8, -7, -6, -5, -4, -3, -2, -1,
        -0.9, -0.8, -0.7, -0.6, -0.5, -0.4, -0.3, -0.2, -0.1,
        0,
        0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10
    ];
    
    var interactiveElements = document.getElementsByClassName("interactive");
    for (var i = 0; i < interactiveElements.length; i++) {
        var interactiveElement = interactiveElements[i];
        loadInteractiveElement(interactiveElement);
    }
    
    
    function loadInteractiveElement(interactiveElement) {
        var name = interactiveElement.getAttribute("data-interact-name");
        var graph = graphs[name];
        
        var currentEquation;
        
        updateEquation(graph.initialEquation);
        
        loadControls(interactiveElement, graph, {
            value: function() {
                return currentEquation;
            },
            update: updateEquation
        });
        
        function updateEquation(equation) {
            currentEquation = equation;
            useEquation(interactiveElement, equation);
        }
        
        interactiveElement.querySelector(".action").addEventListener("click", function() {
            updateEquation(randomEquation(graph.highestPower));
        }, true);
    }
    
    function loadControls(interactiveElement, graph, currentEquation) {
        var controlsElement = interactiveElement.querySelector(".controls");
        var coefficientIndex = 0;
        for (var power = graph.highestPower; power >= 0; power--) {
            var coefficientControl = createCoefficientControl(coefficientIndex, power, currentEquation);
            controlsElement.appendChild(coefficientControl);
            
            coefficientIndex++;
        }
    }
    
    function createCoefficientControl(coefficientIndex, power, currentEquation) {
        var li = $(document.createElement("li"));
        
        var name = $(document.createElement("span"));
        name.addClass("control-name");
        name.text("$$ " + String.fromCharCode("a".charCodeAt(0) + coefficientIndex) + " $$");
        li.append(name);
        
        var less = $(document.createElement("span"));
        less.addClass("action");
        less.addClass("button-less");
        less.text("-");
        li.append(less);
        
        less.on("click", function() {
            var equation = {coefficients: currentEquation.value().coefficients.slice(0)};
            var selectionIndex = coefficientSelection.indexOf(equation.coefficients[power]);
            if (selectionIndex <= 0) {
                equation.coefficients[power]--;
            } else {
                equation.coefficients[power] = coefficientSelection[selectionIndex - 1];
            }
            currentEquation.update(equation);
        });
        
        li.append(createCoefficientSlider(power, currentEquation));
        
        var more = $(document.createElement("span"));
        more.addClass("action");
        more.addClass("button-more");
        more.text("+");
        li.append(more);
        
        more.on("click", function() {
            var equation = {coefficients: currentEquation.value().coefficients.slice(0)};
            var selectionIndex = coefficientSelection.indexOf(equation.coefficients[power]);
            if (selectionIndex === -1 || selectionIndex >= coefficientSelection.length - 1) {
                equation.coefficients[power]++;
            } else {
                equation.coefficients[power] = coefficientSelection[selectionIndex + 1];
            }
            currentEquation.update(equation);
        });
        
        return li.get(0);
    }
    
    function createCoefficientSlider(power, currentEquation) {
        var sliderElement = $('<div class="coefficient-slider">');
        sliderElement.slider({
            min: -10,
            max: 10,
            step: 0.1,
            value: currentEquation.value().coefficients[power]
        });
        sliderElement.on("slide", function(event, ui) {
            var equation = {coefficients: currentEquation.value().coefficients.slice(0)};
            equation.coefficients[power] = ui.value;
            currentEquation.update(equation);
        });
        return sliderElement;
    }
    
    function randomEquation(highestPower) {
        var coefficients = [];
        for (var power = 0; power <= highestPower; power++) {
            coefficients.push(randomElement(coefficientSelection));
        }
        return {coefficients: coefficients};
        
    }
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    function randomElement(elements) {
        return elements[getRandomInt(0, elements.length - 1)];
    }
    
    function useEquation(interactiveElement, equation) {
        displayEquation(interactiveElement.querySelector("*[data-display='equation']"), equation);
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, interactiveElement]);
        
        var graphElement = interactiveElement.querySelector(".graph");
        
        plotEquation(graphElement, function(x) {
            var coefficients = equation.coefficients;
            var total = 0;
            for (var power = 0; power < coefficients.length; power++) {
                total += coefficients[power] * Math.pow(x, power);
            }
            return total;
        });
    }
    
    function displayEquation(element, equation) {
        // TODO: escape
        element.innerHTML = "$$ y = " + termsToLatex(equation) + " $$";
    }
    
    function termsToLatex(equation) {
        var coefficients = equation.coefficients;
        
        var terms = [];
        var suffix;
        for (var power = coefficients.length; power --> 0; ) {
            var coefficient = coefficients[power];
            if (coefficient) {
                if (power === 0) {
                    suffix = "";
                } else if (power === 1) {
                    suffix = "x";
                } else {
                    suffix = "x^" + power;
                }
                terms.push(termToLatex({
                    value: coefficient,
                    suffix: suffix,
                    isFirst: terms.length === 0
                }));
            }
        }
        
        if (terms.length > 0) {
            return terms.join(" ");
        } else {
            return 0;
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
        
        var margin = {top: 20, right: 20, bottom: 20, left: 20},
            width = 400 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

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

