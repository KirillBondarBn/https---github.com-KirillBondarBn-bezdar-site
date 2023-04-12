export class Position{
    constructor (x, y) {
        this.x = x;
        this.y = y;
    }
}

export class Circle {
    constructor (position, radius, color, id) {
        this.position = position;
        this.radius = radius;
        this.id = id;
        this.color = color;
    }
}

export class Square {
    constructor (position, size, color, id) {
        this.position = position;
        this.size = size;
        this.id = id;
        this.color = color;
    }
}

export class Field {
    constructor (canvasID, divID) {
        this.canvas = document.getElementById(canvasID);
        this.context = this.canvas.getContext('2d');
        
        let div = document.getElementById(divID);
        this.canvas.width = div.offsetWidth;
        this.canvas.height = div.offsetHeight;

        this.objects = new Array();
    }

    getUserClickPosition (event) {
        const rectangle = this.canvas.getBoundingClientRect();
        let x = event.clientX - rectangle.left;
        let y = event.clientY - rectangle.top;

        let position = new Position(x, y);
        return position;
    }

    getPointsDistance (positionA, positionB) {
        return Math.sqrt(Math.pow(positionA.x - positionB.x, 2) + Math.pow(positionA.y - positionB.y, 2));
    }

    getObjectByPosition(position) {
        for (let object of this.objects) {
            if (object.radius != null) {
                // todo
            }
            else if(object.size != null) {
                if (position.x - object.position.x >= 0 && position.x - object.position.x <= object.size &&
                    position.y - object.position.y >= 0 && position.y - object.position.y <= object.size) {
                        return object;
                    }
            }
        }
    }

    appendObject(object) {
        this.objects.push(object);
    }

    createObject (cursorPosition, typeOfObject, size, color, id) { // size - radius(circle) \ width(square)
        let position = cursorPosition;
        let object;

        if (typeOfObject == "Circle") {
            object = new Circle(position, size, color, id);
        }
        else if (typeOfObject == "Square") {
            object = new Square(position, size, color, id);
        }

        this.objects.push(object);
    }

    removeObject (cursorPosition) {
        for (let i = 0; i < this.objects.length; i++) {
            let objectPosition = this.objects[i].position;
            if (this.getPointsDistance(cursorPosition, objectPosition) <= this.objects[i].radius) {
                this.objects = this.objects.slice(0, i).concat(this.objects.slice(i + 1));
                break;
            } // TODO
        }
    }

    display () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let object of this.objects) {
            this.context.beginPath();

            this.context.strokeStyle = object.color;
            this.context.fillStyle = object.color;

            if (object.radius != null) {
                this.context.arc(object.position.x, object.position.y, object.radius, 0, 2 * Math.PI);
            }
            else if (object.size != null) {
                this.context.rect(object.position.x, object.position.y, object.size, object.size);
            }
            this.context.fill();

            this.context.stroke();
        }
    }

    clear () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.objects = [];
    }
}