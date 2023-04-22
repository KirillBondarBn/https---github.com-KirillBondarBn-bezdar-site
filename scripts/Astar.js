import { Field, Position, Square } from "../modules/drawning.js";

const field = new Field("maze", "canvas_field");

class Cell {
    constructor (object, type, state, index) {
        this.object = object;
        this.type = type; // types = block, way, fork, start, finish
        this.state = state; // states = free, visited
        this.index = index;
    }
}

class Tractor {
    constructor () {
        this.x = 0;
        this.y = 0;
    }
}

class Graph {
    constructor (vertices) {
        this.adjacencyList = new Array(vertices);
        this.size = vertices;
        for (let i = 0; i < vertices; i++) {
            this.adjacencyList[i] = new Array();
        }
        this.visited = new Array(vertices).fill(false);
    }

    addEdge (vertex, adjacencyIndex, adjacencyColor) {
        let cell;

        if (adjacencyColor == "white") {
            cell = new Cell(field.objects[adjacencyIndex], "way", "free", adjacencyIndex);
        }
        else if (adjacencyColor == "green") {
            cell = new Cell(field.objects[adjacencyIndex], "start", "free", adjacencyIndex);
            startCell = cell;
        }
        else if (adjacencyColor == "red") {
            cell = new Cell(field.objects[adjacencyIndex], "finish", "free", adjacencyIndex);
            finishCell = cell;
        }
        this.adjacencyList[vertex].push(cell);
    }

    async BFS() {
        let queue = [];
        queue.push(startCell);

        let distance = new Array(this.size).fill(-1);
        let previousVertex = new Array(this.size);

        distance[startCell.index] = 0;
        while (queue.length > 0) {
            let currentVertex = queue.shift();
            while (this.adjacencyList[currentVertex.index].length > 0) {
                let adjacencyVertex = this.adjacencyList[currentVertex.index].shift();

                if (distance[adjacencyVertex.index] == -1) {
                    queue.push(adjacencyVertex);
                    distance[adjacencyVertex.index] = distance[currentVertex.index] + 1;
                    currentVertex.object.color = "gray";
                    field.display();
                    await delay(100);
                    previousVertex[adjacencyVertex.index] = currentVertex;
                }
            }
        }

        if (distance[finishCell.index] != -1) {
            let optimalRoute = [];
            let currentVertex = finishCell;

            optimalRoute.push(currentVertex);
            while (currentVertex != startCell) {
                currentVertex = previousVertex[currentVertex.index];
                optimalRoute.push(currentVertex);
            }

            wayVisualisation(optimalRoute);
        }
        else {
            alert("NO WAY");
        }
    }
}

async function wayVisualisation(way) {
    while (way) {
        way.pop().object.color = "pink";
        field.display();
        await delay(100);
    }
}

const maze = document.getElementById("maze");
const context = maze.getContext('2d');

const WALL_COLOR = "black";
const FREE_COLOR = "white";

let mazeSize = parseInt(document.getElementById("set_maze_size").value);
let cellSize = field.canvas.width / mazeSize;
let userMode = "Create";
let startCell;
let finishCell;

let mazeMatrix = createMatrix(mazeSize, mazeSize);

let images = new Array();

const TRACTORS_COUNT = 1000;
let tractors = [];

function initTractors() {
    for (let i = 0; i < TRACTORS_COUNT; i++) {
        tractors.push(new Tractor);
    }
}

mazeMatrix[0][0] = true;
generation()
async function generation() {
    tractors = [];
    initTractors();
    let cnt = 0;
    while (!isValid()) {
        cnt++;
        for (let tractor of tractors) {
            moveTractor(tractor);
        }
        const temp = cloneArray(mazeMatrix);
        images.push(temp);
    }

    cellSize = field.canvas.width / mazeSize; 
    field.clear();
    for (let i = 0; i < mazeSize; i++) {
        for (let j = 0; j < mazeSize; j++) {
            let color = "black";
            if (mazeMatrix[i][j]) {
                color = "white";
            }
            field.appendObject(new Square(new Position(i * cellSize, j * cellSize), cellSize, color, [i, j]))
        }
    }

    field.display();
}

function moveTractor(tractor) {
    let directions = [];

    if (tractor.x > 0) {
        directions.push([-2, 0]);
    }
    if (tractor.x < mazeSize - 1) {
        directions.push([2, 0]);
    }
    if (tractor.y > 0) {
        directions.push([0, -2]);
    }
    if (tractor.y < mazeSize - 1) {
        directions.push([0, 2]);
    }

    const [dx, dy] = getRandomItem(directions);

    tractor.x += dx;
    tractor.y += dy;

    if (!mazeMatrix[tractor.x][tractor.y]) {
        mazeMatrix[tractor.x][tractor.y] = true;
        mazeMatrix[tractor.x - dx / 2][tractor.y - dy / 2] = true;
    }
}

function delay(timeout) {
    return new Promise((resolve) => setTimeout(resolve, timeout));
}

function isValid() {
    for (let y = 0; y < mazeSize; y += 2) {
        for (let x = 0; x < mazeSize; x += 2) {
            if (!mazeMatrix[y][x]) {
                return false;
            }
        }
    }
    return true;
}

maze.height = mazeSize * cellSize;
maze.width = mazeSize * cellSize;

function getRandomItem(array) {
    const index = Math.floor(Math.random() * array.length);
    return array[index];
}

function display() {
    
    for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
            let color;
            if (mazeMatrix[x][y]) {
                color = FREE_COLOR;
            }
            else {
                color = WALL_COLOR;
            }
            context.beginPath();
            context.strokeStyle = color;
            context.fillStyle = color;
            context.rect(x * cellSize, y * cellSize, cellSize, cellSize);
            context.fill();
            context.stroke();
        }
    }
}

function createMatrix(rows, columns) {
    const matrix = [];

    for (let  y = 0; y < rows; y++) {
        const row = [];
        
        for (let x = 0; x < columns; x++) {
            row.push(false);
        }
        matrix.push(row);
    }
    return matrix;
}

function clearWay() {
    for (let object of field.objects) {
        if (object.color != "white" && object.color != "black") {
            object.color = "white";
        }
    }
    field.display();
}

document.getElementById("clear_way").addEventListener("click", function() {
    clearWay()
})

field.canvas.addEventListener("mousedown", function(event) {
    click(event);
})

document.getElementById("set_maze_size").addEventListener("input", function() {
    document.getElementById("label_maze_size").innerText = "Maze size: " + document.getElementById("set_maze_size").value;
    mazeSize = parseInt(document.getElementById("set_maze_size").value);
})

document.getElementById("start").addEventListener("click", function() {
    userMode = "Start";
})

document.getElementById("finish").addEventListener("click", function() {
    userMode = "Finish";
})

document.getElementById("create").addEventListener("click", function() {
    userMode = "Create"
})

document.getElementById("remove").addEventListener("click", function() {
    userMode = "Remove"
})

document.getElementById("generate").addEventListener("click", function() {
    //mazeSize = document.getElementById("set_maze_size").value;
    mazeMatrix = createMatrix(mazeSize, mazeSize);
    mazeMatrix[0][0] = true;
    generation();
})

async function visualisation() {
    images = new Set(images);
    for (let i of images) {
        mazeMatrix = i;
        display();
        await delay(10);
    }
}

function cloneArray(array) {
    let newArray = [];
    for (let i of array) {
        let temp = Array.from(i);
        newArray.push(temp);
    }
    return newArray;
}


var astar = {
    search: function(grid, start, finish) {   
        
    },
    
    // correct
    heuristic: function(positionA, positionB) {
        var distanceA = Math.abs (positionB.x - positionA.x);
        var distanceB = Math.abs (positionB.y - positionA.y);
        return distanceA + distanceB;
    },

    // correct
    neighbors: function(grid, node) {
        var nodes = [];
        var x = node.position.x;
        var y = node.position.y;
    
        if(x - 1 >= 0) {
            if (grid[x-1][y] && !grid[x-1][y].isWall) {
                nodes.push(grid[x-1][y]);
            }
        }
        if (x + 1 < grid.length) {
            if(grid[x+1][y] && !grid[x+1][y].isWall) {
                nodes.push(grid[x+1][y]);
            }
        }
        if (y - 1 >= 0) {
            if(grid[x][y-1] && !grid[x][y-1].isWall) {
                nodes.push(grid[x][y-1]);
            }
        }
        if (y + 1 < grid.length) {
            if(grid[x][y+1] && !grid[x][y+1].isWall) {
                nodes.push(grid[x][y+1]);
            }
        }
        return nodes;
    }
};

function click(event) {
    let position = field.getUserClickPosition(event);
    let color;

    if (userMode == "Create") {
        color = "black";
    }
    else if (userMode == "Remove") {
        color = "white";
    }
    else if (userMode == "Start") {
        if (startCell != null) {
            startCell.color = "white";
        }
        color = "green";
        startCell = field.getObjectByPosition(position);
    }
    else if (userMode == "Finish") {
        if (finishCell != null) {
            finishCell.color = "white";
        }
        color = "red";
        finishCell = field.getObjectByPosition(position);
    }

    field.getObjectByPosition(position).color = color;

    field.display();
}

function solve() {
    let graph = new Graph(field.objects.length);
    for (let i = 0; i < field.objects.length; i++) {
        if (i >= mazeSize) {
            let index = i - mazeSize;
            if (field.objects[index].color != "black") {
                let color = field.objects[index].color;
                graph.addEdge(i, index, color);
            }
        }
        if (i < field.objects.length - mazeSize - 2) {
            let index = i + mazeSize;
            if (field.objects[index].color != "black") {
                let color = field.objects[index].color;
                graph.addEdge(i, index, color);
            }
        }
        if (i % mazeSize > 0) {
            let index = i - 1;
            if (field.objects[index].color != "black") {
                let color = field.objects[index].color;
                graph.addEdge(i, index, color);
            }
        }
        if (i % mazeSize < mazeSize - 1) {
            let index = i + 1;
            if (field.objects[index].color != "black") {
                let color = field.objects[index].color;
                graph.addEdge(i, index, color);
            }
        }
    }
    graph.BFS();
    
    field.display();
}

document.getElementById("solve").addEventListener("click", function() {
    solve();
})

field.display();