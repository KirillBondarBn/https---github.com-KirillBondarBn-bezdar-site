import { Field, Position } from "../modules/drawning.js";

class Cluster {
    constructor (position, id, color) {
        this.position = position;
        this.id = id;
        this.color = color;
    }
}

let field = new Field("clustering_field", "drawning_field");
let userMode = "Draw";
let pointRadius = 10;
let clusterCount = 2;

const colors = ["#f08080", "#a0c4ff", "#60d394", "#ffd97d", "#A5A5A5", "#f46036", "#0f7173", "#6c5b7b", "#a01a7d", "#d5ac4e"];
const clusterCountRange = document.getElementById("clusterCount");
const labelClusterCount = document.getElementById("labelClusterCount");
const userModeLabel = document.getElementById("stateMode");
const setDrawModeButton = document.getElementById("draw");
const setRemoveModeButton = document.getElementById("remove");
const radiusRange = document.getElementById("radiusRange");
const labelRange = document.getElementById("labelRange");
const kMeansButton = document.getElementById("k-means");
const clearFieldButton = document.getElementById("clear");

function setUserMode(value) {
    userModeLabel.innerText = "Active mode: " + value;
    userMode = value;
}

function setPointRadius(value) {
    pointRadius = value;
}

function setClusterCount(value) {
    if (value <= field.objects.length) {
        clusterCount = value;
    } 
    else {
        clusterCountRange.value = field.objects.length;
    }
    labelClusterCount.innerText = "Clusters count: " + clusterCountRange.value;
}

function click(event) {
    let cursorPosition = field.getUserClickPosition(event);

    if (userMode == "Draw") {
        field.createObject(cursorPosition, "Circle", pointRadius, "White", 1);
    }
    else if (userMode == "Remove") {
        field.removeObject(cursorPosition);
        setClusterCount(clusterCountRange.value);
    }
    else if (userMode == "Clear") {
        field.clear();
        setClusterCount(clusterCountRange.value);
    }

    field.display();
}

function k_means() {
    console.log(clusterCountRange.value, field.objects.length)
    if (clusterCountRange.value > field.objects.length) {
        console.log("lol")
        alert("Set more points");
        return;
    }

    let clusters = new Array(clusterCount);

    let temp = new Array(field.objects.length).fill(0);
    let index;
    for (let i = 0; i < clusterCount; i++) {
        index = parseInt(Math.random()*field.objects.length);
        while (temp[index] != 0) {
            index = parseInt(Math.random()*field.objects.length);
        }
        temp[index] = 1;
        let position = field.objects[index].position;

        let cluster = new Cluster(new Position(position.x, position.y), i, colors[i]);
        clusters[i] = cluster;
    }

    for (let i = 0; i < 10000; i++) {
        for (let object of field.objects) {
            let minDistance = 100000;
            for (let cluster of clusters) {
                let currentDistance = field.getPointsDistance(object.position, cluster.position) - object.radius;

                if (currentDistance < minDistance) {
                    minDistance = currentDistance;

                    object.color = cluster.color;
                    object.id = cluster.id;
                }
            }
        }

        for (let cluster of clusters) {
            let count = 0;
            let sumX = 0;
            let sumY = 0;
            for (let object of field.objects) {
                if (object.id == cluster.id) {
                    count++;
                    sumX += object.position.x;
                    sumY += object.position.y;
                }
            }

            cluster.position.x = parseInt(sumX / count);
            cluster.position.y = parseInt(sumY / count);
        }
    }

    field.display();
}

// All event listeners
field.canvas.addEventListener("mousedown", function(event) {
    click(event)
})

setDrawModeButton.addEventListener("click", function() {
    setUserMode("Draw")
})

setRemoveModeButton.addEventListener("click", function() {
    setUserMode("Remove")
})

radiusRange.addEventListener("change", function(event) {
    labelRange.innerText = "Point radius: " + radiusRange.value;
    setPointRadius(parseInt(radiusRange.value))
})

clusterCountRange.addEventListener("change", function() {
    setClusterCount(parseInt(clusterCountRange.value));
})

kMeansButton.addEventListener("click", function() {
    k_means();
});

clearFieldButton.addEventListener("click", function() {
    field.clear();
    clusterCountRange.value = 2;
    clusterCount = 2;
})
