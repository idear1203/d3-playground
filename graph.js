var force = d3.layout.force()
    .gravity(0.3)
    .charge(-3000)
    .linkDistance(300);

var svg = d3
    .select("#graph")
    .append("svg")
    .attr("pointer-events", "all");

d3.json("graph.json", function (error, graph) {
    if (error) return;

    var edges = [];
    graph.links.forEach(function(e) {
        var sourceNode = graph.nodes.filter(function(n) { return n.id === e.source; })[0],
            targetNode = graph.nodes.filter(function(n) { return n.id === e.target; })[0];
        edges.push({source: sourceNode, target: targetNode});
    });

    graph.links = edges;

    force.nodes(graph.nodes)
        .links(graph.links)
        .start();

    var links = svg.selectAll(".link")
        .data(graph.links)
        .enter()
        .append("line")
        .attr("class", "link");

    var nodes = svg.append("g")
        .attr("class", "nodes")
        .selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", function(d) {
            return "node " + d.label;
        })
        .call(force.drag);

    var movies = d3.selectAll(".movie");
    movies.append("circle")
        .attr("r", function(d) { return d.radius = 50; });


    movies.append("title")
     .text(function(d) {return d.title });

    var actors = d3.selectAll(".actor")
            .append("rect")
            .attr("width", function(d) { return d.width = 100; })
            .attr("height", function(d) {return d.height = 100; });

    actors.append("title")
     .text(function(d) {return d.name });

    resize();
    d3.select(window).on("resize", resize);

    // html title attribute

    // force feed algo ticks
    force.on("tick", function () {
        var q = d3.geom.quadtree(graph.nodes),
        i = 0,
        n = graph.nodes.length;

        while (++i < n) q.visit(collide(graph.nodes[i]));

        //nodes.attr("transform", transform);
        movies.attr("transform", transformMovies);
        actors.attr("transform", transformActors);

        links.attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });
    });
});

function transformMovies(d) {
    d.x = Math.max(d.radius, Math.min(width - d.radius, d.x));
    d.y = Math.max(d.radius, Math.min(height - d.radius, d.y));
    transform(d);
}

function transformActors(d) {
    d.x = Math.max(0, Math.min(width - d.width, d.x));
    d.y = Math.max(0, Math.min(height - d.height, d.y));
    transform(d);
}

function transform(d) {
    return "translate(" + d.x + "," + d.y + ")";
}

function collide(node) {
    var r = node.radius + 100,
    nx1 = node.x - r,
    nx2 = node.x + r,
    ny1 = node.y - r,
    ny2 = node.y + r;
    return function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
            var x = node.x - quad.point.x,
            y = node.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = node.radius + quad.point.radius;
            if (l < r) {
                l = (l - r) / l * .5;
                node.x -= x *= l;
                node.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
            }
        }

        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };
}

function resize() {
    width = window.innerWidth, height = window.innerHeight;
    svg.attr("width", width).attr("height", height);
    force.size([width, height]).resume();
}
