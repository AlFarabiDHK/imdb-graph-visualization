// Muhtasim Al-Farabi
// CSC 343 F23
import GraphClass from "./GraphClass.js";

var newEdge = {
    source: "",
    target: ""
}
var newNode = {
    id: ""
};
var newlyConnectedNodes = [];

// read the imdb_data.json file onto a variable
var imdbData;
var imdbDataModified;
fetch("imdb_data.json").then((res) => res.json()).then((data) => { 
    imdbData = data["nodes"];
    imdbDataModified = {};
for(let i = 0; i < imdbData.length; i++){
    imdbDataModified[imdbData[i]["id"]] = imdbData[i];
}
});

// read from movie-img_links.json file and for each movie id, add two new key-value pair to imdbDataModified, one for poster_url_small and one for poster_url_large

fetch("movie-img_links.json").then((res) => res.json()).then((data) => {
    let movieImgLinks = data;
    for(let i = 0; i < movieImgLinks.length; i++){
        imdbDataModified[movieImgLinks[i]["id"]]["poster_url_small"] = movieImgLinks[i]["small_img_link"];
        imdbDataModified[movieImgLinks[i]["id"]]["poster_url_large"] = movieImgLinks[i]["large_img_link"];
    }

}).catch((err) => console.log(err));

// modify imdbdata so that the movie ids map to all other features
function forceDirectedGraph(graphData){
    d3.select("#graphviz svg").remove();
    let graphObj = new GraphClass();
    graphObj.graph = graphData;
    displayGraphStatistics(graphObj);
    let searchedElement;

    const width = window.innerWidth * 0.7;
    const height = window.innerHeight * 0.9;
    const distance = 30;
    const strength = -60;
    const nodeRadius = 7;
    const nodeColor = "#21130d";
    const edgeColor = "#9c9a9a";
    const edgeOpacity = "0.6";
    const connectedEdgeColor = "#ff0000";
    const newNodeColor = "#87CEEB";
    const connectedNodeColor = "#66ff00";
    const largestConnectedComponentColor = "#ff00ff";
    const nonLargestConnectedComponentColor = "#d3d3d3";

    // deep copy the edges and nodes array
    const edges = graphData.edges.map(d => ({
        ...d
    }));
    const nodes = graphData.nodes.map(d => ({
        ...d
    }));


    const svg = d3.select("#graphviz").append("svg").attr("width", width).attr("height", height)
    // constructing edge svg
    const edge = svg.append("g").selectAll().data(edges).join("line").attr("stroke-opacity", d => {
        if ((newEdge.source == d.source && newEdge.target == d.target) || (newEdge.source == d.target && newEdge.target == d.source)) {
            return "1";
        }
        return edgeOpacity;
    }).attr("stroke", d => {
        if ((newEdge.source == d.source && newEdge.target == d.target) || (newEdge.source == d.target && newEdge.target == d.source)) {
            return connectedEdgeColor;
        }

        return edgeColor;
    });

    // add an event handler to id = "force-flip-toggle" that will
    // toggle

    // creating node svg
    const node = svg.append("g").attr("stroke", "#fff").attr("stroke-width", 1).selectAll().data(nodes).join("circle").attr("r", nodeRadius).attr("fill", d => { // new nodes are colored differently
        if (newNode.id == d.id) {
            return newNodeColor;
        }
        // if the nodes is in the largest connected component, color it differently

        if (newlyConnectedNodes.includes(d.id)) {
            return connectedNodeColor;
        }
        return nodeColor;
    }).attr("id", d => d.id);
    // init simulation
    const simulation = d3.forceSimulation(nodes).force("link", d3.forceLink(edges).distance(distance).id(e => e.id)).force("charge", d3.forceManyBody().strength(strength)).force("x", d3.forceX(width / 2)).force("y", d3.forceY(height / 2)).on("tick", () => {
        edge.attr("x1", e => e.source.x).attr("y1", e => e.source.y).attr("x2", e => e.target.x).attr("y2", e => e.target.y);

        node.attr("cx", e => e.x).attr("cy", e => e.y);
    });

    // connect two nodes
    node.on("click", (e1, d1) => {
        d3.select("#" + d1.id).attr("fill", "#ffa500");
        node.on("click", (e2, d2) => {
            if (d1.id == d2.id) {
                window.alert("Cannot connect a node to itself!");
            } else if (newlyConnectedNodes.includes(d1.id) && newlyConnectedNodes.includes(d2.id)) {
                window.alert("Nodes are already connected!");
            } else {
                newEdge = {
                    source: d1.id,
                    target: d2.id
                }
                newlyConnectedNodes = [d1.id, d2.id];
                graphData.edges.push(newEdge);
                renderGraph(graphData);
            }

        });
    });

    node.on("mouseover", (e1, d1) => {
        var selected = document.getElementById("select-info-type");
        var selectedOptionValue = selected.options[selected.selectedIndex];
        document.getElementById("node-name").textContent = imdbDataModified[d1.id][selectedOptionValue.value];
        document.getElementById("movieName").textContent = imdbDataModified[d1.id]["name"];
        document.getElementById("movieId").textContent = imdbDataModified[d1.id]["id"];
        document.getElementById("movieRank").textContent = imdbDataModified[d1.id]["rank"];
        document.getElementById("movieYear").textContent = imdbDataModified[d1.id]["year"];
        document.getElementById("movieRating").textContent = imdbDataModified[d1.id]["imdb_rating"];
        document.getElementById("totalDuration").textContent = imdbDataModified[d1.id]["duration"];
        document.getElementById("genreName").textContent = imdbDataModified[d1.id]["genre"];
        document.getElementById("directorName").textContent = imdbDataModified[d1.id]["director_name"];
        document.getElementById("movie-poster").src = imdbDataModified[d1.id]["poster_url_small"];
    }).on("mouseout", (e1, d1) => {
        document.getElementById("node-name").textContent = "";
        document.getElementById("movieName").textContent = "";
        document.getElementById("movieId").textContent = "";
        document.getElementById("movieRank").textContent = "";
        document.getElementById("movieYear").textContent = "";
        document.getElementById("movieRating").textContent = "";
        document.getElementById("totalDuration").textContent = "";
        document.getElementById("genreName").textContent = "";
        document.getElementById("directorName").textContent = "";
        document.getElementById("movie-poster").src = "";
    });

    // add node

    d3.select("#add-node").on("click", () => {
        const userInput = document.getElementById("add-node-input").value;
        
        if (graphData.nodes.some(node => node.id == userInput)) {
            window.alert("Node exists in the graph!")
        } else if (userInput == '') {
            window.alert("Cannot add empty node!");
        } else {
            document.getElementById("add-node-input").value = "";
            newNode = {
                id: userInput
            };
            graphData.nodes.push(newNode);

            renderGraph(graphData);
        }

    });
    document.getElementById("search-node").addEventListener("keypress", (e) => {  
        if(e.key === 'Enter'){
            let userInput = document.getElementById("search-node").value;
            let userChoice = document.getElementById("select-info-type-search").value
            let choice;
            let searchedElement = [];
            for(let i = 0; i < imdbData.length; i++){
                if(userChoice == "rank"){
                    if(imdbData[i][userChoice] == parseInt(userInput)){
                        searchedElement.push(imdbData[i]["id"]);
                    }
                    continue;
                }
                userInput = userInput.toLowerCase();
                choice = imdbData[i][userChoice].toLowerCase();
                if(choice.includes(userInput)){
                    searchedElement.push(imdbData[i]["id"]);
                }
            }

            node.attr("fill", d => {
                if (searchedElement.includes(d.id)) {
                    return "#ff0000";
                }
                return nonLargestConnectedComponentColor;
            });
            // increase diameter
            node.attr("r", d => {
                if (searchedElement.includes(d.id)) {
                    return nodeRadius * 1.2;
                }
                return nodeRadius * 0.75;
            });
        }
        else{
            // revert back to original colors
            node.attr("fill", d => { // new nodes are colored differently
                if (newNode.id == d.id) {
                    return newNodeColor;
                }
                // if the nodes is in the largest connected component, color it differently

                if (newlyConnectedNodes.includes(d.id)) {
                    return connectedNodeColor;
                }
                return nodeColor;
            });
        }
     });

    document.getElementById("largest-connected-toggle").addEventListener("change", function (e) {
        let largestConnectedComponent = graphObj.findLargestConnectedComponent();
        // put all the nodes from largestConnectedComponent into an array
        let largestConnectedComponentNodes = [];
        for (let i = 0; i < largestConnectedComponent.nodes.length; i++) {
            largestConnectedComponentNodes.push(largestConnectedComponent.nodes[i].id);
        }
        if (e.target.checked) {
            node.attr("fill", d => {

                if (largestConnectedComponentNodes.includes(d.id)) {
                    return largestConnectedComponentColor;
                }
                return nonLargestConnectedComponentColor;
            });

            // increase diameter
            node.attr("r", d => {
                if (largestConnectedComponentNodes.includes(d.id)) {
                    return nodeRadius * 1.2;
                }
                return nodeRadius * 0.75;
            });
            // display the graph statistics using this graph
            let graphObjL = new GraphClass();
            graphObjL.graph = largestConnectedComponent;
            displayGraphStatistics(graphObjL);
        }
        else{
            node.attr("fill", d => { // new nodes are colored differently
                if (newNode.id == d.id) {
                    return newNodeColor;
                }
                // if the nodes is in the largest connected component, color it differently

                if (newlyConnectedNodes.includes(d.id)) {
                    return connectedNodeColor;
                }
                return nodeColor;
            });
            node.attr("r", d => {
                return nodeRadius;
            });
            displayGraphStatistics(graphObj);
        }
        
    });
}

function renderGraph(graphData) { // reset the graph
    forceDirectedGraph(graphData);
}


/*
    Function to fetch the JSON data from output_graph.json & call the renderGraph() method
    to visualize this data
*/
function loadAndRenderGraph(fileName) {
    fetch(fileName).then((res) => res.json()).then((data) => {

        renderGraph(data);

    }).catch((err) => console.log(err));

}


function displayGraphStatistics(graphObj) {
    document.getElementById("avgDegree").textContent = graphObj.computeAverageNodeDegree().toFixed(5);
    document.getElementById("numComponents").innerText = graphObj.computeConnectedComponents();
    document.getElementById("graphDensity").innerText = graphObj.computeGraphDensity().toFixed(5);
    document.getElementById("graphDiameter").innerText = graphObj.findGraphDiameter();
    document.getElementById("graphAPL").innerText = graphObj.computeAPL().toFixed(5);
}



var fileName = "output_graph.json";
loadAndRenderGraph(fileName);
