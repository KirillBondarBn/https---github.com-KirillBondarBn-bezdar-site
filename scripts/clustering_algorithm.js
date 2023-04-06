import { Field, Position } from "../modules/drawning.js";

class Cluster {
    constructor (position, id, color) {
        this.position = position;
        this.id = id;
        this.color = color;
    }
}

let field = new Field("clustering_field", "drawning_field");
const colors = ["#f08080", "#a0c4ff", "#60d394", "#ffd97d", "#001427", "#f46036", "#0f7173", "#6c5b7b", "#a01a7d", "#d5ac4e"];
let userMode = "Draw";
let pointRadius = 10;
let clusterCount = 2;

function setUserMode(value) {
    userMode = value;
}

function setPointRadius(value) {
    pointRadius = value;
}

function setClusterCount(value) {
    clusterCount = value;
}

function click(event) {
    let cursorPosition = field.getUserClickPosition(event);

    if (userMode == "Draw") {
        field.createObject(cursorPosition, "Circle", pointRadius, "Black", 1);
    }
    else if (userMode == "Remove") {
        field.removeObject(cursorPosition);
    }

    field.display();
}

field.canvas.addEventListener("mousedown", function(event) {
    click(event)
})

document.getElementById("add").addEventListener("click", function() {
    document.getElementById("stateMode").innerText = "Active mode: Draw";
    setUserMode("Draw")
})

document.getElementById("delete").addEventListener("click", function() {
    document.getElementById("stateMode").innerText = "Active mode: Remove";
    setUserMode("Remove")
})

document.getElementById("radiusRange").addEventListener("change", function(event) {
    document.getElementById("labelRange").innerText = "Point radius: " + document.getElementById("radiusRange").value;
    setPointRadius(parseInt(document.getElementById("radiusRange").value))
})

document.getElementById("clusterCount").addEventListener("change", function() {
    document.getElementById("labelClusterCount").innerText = "Clusters count: " + document.getElementById("clusterCount").value;
    setClusterCount(parseInt(document.getElementById("clusterCount").value));
})

document.getElementById("k-means").addEventListener("click", function() {
    k_means();
});

function k_means() {
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