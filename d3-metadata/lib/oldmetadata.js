/* ------------------------------------

Search functionality

---------------------------------------*/

//Variable to hold autocomplete options
var keys;

//Load US States as options from CSV - but this can also be created dynamically
d3.csv("states.csv", function (csv) {
    keys = csv;
    start();
});


//Call back for when user selects an option
function onSelect(d) {
    alert(d.State);
}

//Setup and render the autocomplete
function start() {
    var mc = autocomplete(document.getElementById('search'))
        .keys(keys)
        .dataField("State")
        .placeHolder("Search States - Start typing here")
        .width(960)
        .height(500)
        .onSelected(onSelect)
        .render();
}

/* ------------------------------------

D3 set up

---------------------------------------*/

var m = [20, 120, 20, 120],
    w = 1480 - m[1] - m[3],
    h = 800 - m[0] - m[2],
    i = 0,
    root;

var tree = d3.layout.tree()
    .size([h, w]);

var diagonal = d3.svg.diagonal()
    .projection(function (d) {
    return [d.y, d.x];
});

var vis = d3.select("#body").append("svg:svg")
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
    .append("svg:g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

d3.json("iso.json", function (json) {
    root = json;
    //console.log(root);
    root.x0 = h / 2;
    root.y0 = 0;
    //console.log(JSON.stringify(root));
    //var parsejson = JSON.parse(root);
    //console.log(parsejson);
    //console.log(root["name"]);
    /*for (var key in root) {
    if (root.hasOwnProperty(key)) {
      console.log(key + " -> " + root[key]);
    }
  }*/

    //root.children.forEach(function(d) { console.log(d.name); });

    /*function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else if (i == key && obj[key] == val) {
            objects.push(obj);
        }
    }
    return objects;
}

function getObjects2(obj, key) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key));
        } else if (i == key) {
            objects.push(obj);
        }
    }
    return objects;
}
  test = getObjects2(root, 'name');
  console.log(test);

  for (var i = 0; i < root.length; i++) {
    for (var prop in root[i]) {
        if (root[i].hasOwnProperty(prop)) {
            var key = prop;
            break;
        }
    }
    console.log(key);
}*/


    function toggleAll(d) {
        if (d.children) {
            d.children.forEach(toggleAll);
            toggle(d);
        }
    }

    // Initialize the display to show a few nodes.
    root.children.forEach(toggleAll);
    //toggle(root.children[0]);
    //toggle(root.children[2].children[0]);
    update(root);
});

/*function separation(a, b) {
  return a.parent == b.parent ? 1 : 5;
};*/

function update(source) {
    var duration = d3.event && d3.event.altKey ? 5000 : 500;

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse();

    // Normalize for fixed-depth.
    nodes.forEach(function (d) {
        d.y = d.depth * 180;
    });

    // Update the nodes…
    var node = vis.selectAll("g.node")
        .data(nodes, function (d) {
        return d.id || (d.id = ++i);
    });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("svg:g")
        .attr("class", "node")
        .attr("transform", function (d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
    })
        .on("click", function (d) {
        toggle(d);
        update(d);
    })
        .on("mouseover", function (d) {
        var g = d3.select(this); // The node
        // The class is used to remove the additional text later
        var info = g.append('text')
            .classed('info', true)
            .attr('x', -30)
            .attr('y', -10)
            .text(function (d) {
            return d.humanname;
        });
    })
        .on("mouseout", function () {
        // Remove the info text on mouse out.
        d3.select(this).select('text.info').remove();
    });

    nodeEnter.append("svg:circle")
        .attr("r", 1e-6)
        .style("fill", function (d) {
        return d._children ? "lightsteelblue" : "#fff";
    });

    nodeEnter.append("svg:text")
        .attr("x", function (d) {
        return d.children || d._children ? -10 : 10;
    })
        .attr("dy", ".35em")
        .attr("text-anchor", function (d) {
        return d.children || d._children ? "end" : "start";
    })
        .text(function (d) {
        return d.name;
    })
        .style("fill-opacity", 1e-6);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function (d) {
        return "translate(" + d.y + "," + d.x + ")";
    });

    nodeUpdate.select("circle")
        .attr("r", 4.5)
        .style("fill", function (d) {
        return d._children ? "lightsteelblue" : "#fff";
    });

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function (d) {
        return "translate(" + source.y + "," + source.x + ")";
    })
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

    // Update the links…
    var link = vis.selectAll("path.link")
        .data(tree.links(nodes), function (d) {
        return d.target.id;
    });

    // Enter any new links at the parent's previous position.
    link.enter().insert("svg:path", "g")
        .attr("class", "link")
        .attr("d", function (d) {
        var o = {
            x: source.x0,
            y: source.y0
        };
        return diagonal({
            source: o,
            target: o
        });
    })
        .transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function (d) {
        var o = {
            x: source.x,
            y: source.y
        };
        return diagonal({
            source: o,
            target: o
        });
    })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

// Toggle children.
function toggle(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
}

function mouseover(d) {
    d3.select(this).append("text")
        .attr("class", "hover")
        .attr('transform', function (d) {
        return 'translate(5, -10)';
    })
        .text(d.name + ": " + d.id);
}

// Toggle children on click.
function mouseout(d) {
    d3.select(this).select("text.hover").remove();
}

/* ------------------------------------

Search functionality

---------------------------------------*/