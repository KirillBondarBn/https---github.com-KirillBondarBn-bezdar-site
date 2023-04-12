import { Field, Position, Square } from "../modules/drawning.js";

class Cell {
    constructor (object, type, state, index) {
        this.object = object;
        this.type = type; // types = block, way, fork, start, finish
        this.state = state; // states = free, visited
        this.index = index;
    }
}

function wayVisualisation(way) {
    setTimeout(function() {
        way.pop().object.color = "pink";
        field.display();
        if (way.length > 0) {
            wayVisualisation(way);
        }
    }, 15);
}
// async function
// await delay
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

    BFS() {
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
            console.log("NO WAY");
        }
    }
}

let field = new Field("canvas_field", "div_field");
field.canvas.height = 600;
field.canvas.width = 600;

let startCell;
let finishCell;

let userMode = "Create";

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

field.canvas.addEventListener("mousedown", function(event) {
    click(event);
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
    generateLabirint(document.getElementById("field_size").value)
})

document.getElementById("solve").addEventListener("click", function() {
    solve(parseInt(document.getElementById("field_size").value))
})

document.getElementById("clear_way").addEventListener("click", function() {
    clearWay()
})

function clearWay() {
    for (let object of field.objects) {
        if (object.color == "pink") {
            object.color = "white";
        }
    }
    field.display();
}

function solve(mazeSize) {
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

function generateLabirint(fieldSize) {
    field.clear();
    let cellSize = parseInt(field.canvas.offsetWidth / fieldSize);
    let fieldMatrix = new Array(fieldSize);
    
    let i = 0;
    let j = 0;
    for (let x = 0; x <= field.canvas.offsetWidth - cellSize; x += cellSize) {
        fieldMatrix[i] = new Array(fieldSize);
        j = 0;
        for (let y = 0; y <= field.canvas.offsetWidth - cellSize; y += cellSize) {
            let cell = new Square(new Position(x, y), cellSize, "black", [i, j]);
            field.appendObject(cell);
            fieldMatrix[i][j] = cell;
            j++
        }
        i++;
    }


    let x = parseInt(Math.random() * (fieldSize - 1) / 2) * 2;
    let y = parseInt(Math.random() * (fieldSize - 1) / 2) * 2;

    fieldMatrix[x][y].color = "white";
    let check = new Array();

    if (y - 2 >= 0) {
        check.push(fieldMatrix[x][y - 2]);
    }
    if (y + 2 < fieldSize) {
        check.push(fieldMatrix[x][y + 2]);
    }
    if (x - 2 >= 0) {
        check.push(fieldMatrix[x - 2][y]);
    }
    if (x + 2 < fieldSize) {
        check.push(fieldMatrix[x + 2][y]);
    }
    let lol = 0;
    while (check.length > 0 && lol < 100) {
        let index = Math.floor(Math.random() * (check.length - 1));
        let cell = check[index];
        x = cell.id[0];
        y = cell.id[1];
        cell.color = "white";
        check.splice(index, 1);

        let directions = ["up", "down", "right", "left"];
        while (directions.length > 0) {
            let directionIndex = Math.floor(Math.random() * (directions.length - 1));
            switch (directions[directionIndex]) {
                case "up":
                    if (y - 2 >= 0) {
                        if (fieldMatrix[x][y - 2].color == "white") {
                            fieldMatrix[x][y - 1].color = "white";
                            directions = [];
                        }
                    }
                    break;
                case "down":
                    if (y + 2 < fieldSize) {
                        if (fieldMatrix[x][y + 2].color == "white") {
                            fieldMatrix[x][y + 1].color = "white";
                            directions = [];
                        }
                    }
                    break;
                case "right":
                    if (x - 2 >= 0) {
                        if (fieldMatrix[x - 2][y].color == "white") {
                            fieldMatrix[x - 1][y].color = "white";
                            directions = [];
                        }
                    }
                    break;
                case "left":
                    if (x + 2 < fieldSize) {
                        if (fieldMatrix[x + 2][y].color == "white") {
                            fieldMatrix[x + 1][y].color = "white";
                            directions = [];
                        }
                    }
                    break;
            }
            directions.splice(directionIndex, 1);
        }
        if (y - 2 >= 0) {
            if (fieldMatrix[x][y - 2].color == "black") {
                check.push(fieldMatrix[x][y - 2]);
            }
        }
        if (y + 2 < fieldSize) {
            if (fieldMatrix[x][y + 2].color == "black") {
                check.push(fieldMatrix[x][y + 2]);
            }
        }
        if (x - 2 >= 0) {
            if (fieldMatrix[x - 2][y].color == "black") {
                check.push(fieldMatrix[x - 2][y]);
            }
        }
        if (x + 2 < fieldSize) {
            if (fieldMatrix[x + 2][y].color == "black") {
                check.push(fieldMatrix[x + 2][y]);
            }
        }
        lol++;
    }

    field.display();
}