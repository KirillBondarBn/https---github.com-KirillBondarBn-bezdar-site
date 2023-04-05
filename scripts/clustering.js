//СТАРЫЙ КОД

class Position{
    constructor (x, y) {
        this.x = x;
        this.y = y;
    }
}

class Point {
    constructor (x, y, cluster, radius, color) {
        this.position = new Position(x, y);
        this.cluster = cluster;
        this.radius = radius;
        this.color = color;
    }
}

class Cluster {
    constructor (x, y, id, color) {
        this.position = new Position(x, y);
        this.id = id;
        this.color = color;
    }
}

const canvas = document.getElementById("clustering_field");
const context = canvas.getContext('2d');
var points = new Array();
var drawningMode = "Draw";
const colors = ["#f08080", "#a0c4ff", "#60d394", "#ffd97d", "#001427", "#f46036", "#0f7173", "#6c5b7b", "#a01a7d", "#d5ac4e"];

let div = document.getElementById('drawning_field');
canvas.width = div.offsetWidth;
canvas.height = div.offsetHeight;

function setDrawMode() {
    document.getElementById('stateMode').innerText = "Active mode: Drawning";
    drawningMode = "Draw";
}

function setRemoveMode() {
    document.getElementById('stateMode').innerText = "Active mode: Remove";
    drawningMode = "Remove";
}

function setInformationMode() {
    document.getElementById('stateMode').innerText = "Active mode: Information";
    drawningMode = "Info";
}

function getUserClickPosition(event) {
    const rectangle = canvas.getBoundingClientRect();
    let x = event.clientX - rectangle.left;
    let y = event.clientY - rectangle.top;

    let position = new Position(x, y);
    return position;
}

function getPointsDistance(positionA, positionB) {
    return Math.sqrt(Math.pow(positionA.x - positionB.x, 2) + Math.pow(positionA.y - positionB.y, 2));
}

function spaceIsFree(point) {
    for (let i = 0; i < points.length; i++) {
        if (getPointsDistance(point.position, points[i].position) <= (point.radius + points[i].radius)) {
            return false;
        }
    }
    return true;
}

function addPoint(cursorPosition) {
    let radius = document.getElementById('radiusRange');
    let point = new Point(cursorPosition.x, cursorPosition.y, -1, parseInt(radius.value), "black");

    if (spaceIsFree(point)) {
        points.push(point);
    }

    display();
}

function removePoint(cursorPosition) {
    for (let i = 0; i < points.length; i++) {
        let pointPosition = points[i].position;
        if (getPointsDistance(cursorPosition, pointPosition) <= points[i].radius) {
            points = points.slice(0, i).concat(points.slice(i + 1));
            break;
        }
    }
}

function showPointInfo(cursorPosition) {
    for (let point of points) {
        let pointPosition = point.position;
        if (getPointsDistance(cursorPosition, pointPosition) <= point.radius) {
            document.getElementById('x_info').textContent = "X: " + point.position.x;
            document.getElementById('y_info').textContent = "Y: " + point.position.y;
            document.getElementById('radius_info').textContent = "Radius: " + point.radius;
            document.getElementById('cluster_info').textContent = "Cluster: " + point.cluster;

            let infoCanvas = document.getElementById('color_info_canvas');
            let infoCanvasContext =  infoCanvas.getContext('2d');
            infoCanvasContext.fillStyle = point.color;
            infoCanvasContext.fillRect(0, 0, infoCanvas.width, infoCanvas.height);

            break;
        }
    }
}

function click(event) {
    let cursorPosition = getUserClickPosition(event);

    if (drawningMode == "Draw") {
        addPoint(cursorPosition);
    }
    else if (drawningMode == "Remove") {
        removePoint(cursorPosition);
    }
    else if (drawningMode == "Info") {
        showPointInfo(cursorPosition);
    }

    display();
}

canvas.addEventListener('mousedown', function(event) {
    click(event);
})

function display() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < points.length; i++) {
        context.beginPath();

        context.strokeStyle = points[i].color;
        context.fillStyle = points[i].color;
        
        if (points[i].radius != null) {
            context.arc(points[i].position.x, points[i].position.y, points[i].radius, 0, 2 * Math.PI);
        }
        context.fill();

        context.stroke();
    }
}

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    points = [];
}

function setPointRadius() {
    document.getElementById('labelRange').innerText = "Point radius: " + document.getElementById("radiusRange").value;
}

function setValidClusterCount() {
    let clusterCount = document.getElementById('clusterCount');
    if (parseInt(clusterCount.value) > points.length) {
        clusterCount.value = points.length;
    }

    document.getElementById('labelClusterCount').innerText = "Clusters count: " + clusterCount.value;
}

// Алгоритмы кластеризации

function k_means() {
    let clusterCount = parseInt(document.getElementById('clusterCount').value);
    let clusters = new Array(clusterCount);

    let temp = new Array(points.length).fill(0);
    for (let i = 0; i < clusterCount; i++) {
        let index = parseInt(Math.random()*points.length);
        while (temp[index] != 0) {
            index = parseInt(Math.random()*points.length);
            temp[index] = 1;
        }

        let position = points[index].position;

        cluster = new Cluster(position.x, position.y, i + 1, colors[i]);
        console.log(colors[i]);
        clusters[i] = cluster;
    }

    let switches = 1;
    let lol = 0;

    while (lol < 10000) {
        switches = 0;
        for (let point of points) {
            let minDistance = 1000000;
            for (let cluster of clusters) {
                let currentDistance = getPointsDistance(point.position, cluster.position) - point.radius;
                //кирилл лох
                if (currentDistance < minDistance) {
                    minDistance = currentDistance;

                    point.color = cluster.color;
                    point.cluster = cluster.id;
                }
            }
        }

        for (let cluster of clusters) {
            let count = 0, sumX = 0, sumY = 0;
            for (let point of points) {
                if (point.cluster == cluster.id) {
                    count++;
                    sumX += point.position.x;
                    sumY += point.position.y;
                }
            }

            if (cluster.position.x != parseInt(sumX / count) || cluster.position.y != parseInt(sumY / count)){
                switches++;
            }
            cluster.position.x = parseInt(sumX / count);
            cluster.position.y = parseInt(sumY / count);
        }
        lol++;
    }

    for (let cluster of clusters) {
        for (let point of points) {
            if (point.cluster == cluster.id) {
                cluster.children.push(point);
            }
        }
    }
    
    display();
}


//Взвешенный центроидный метод (медиана)