import { Field, Position } from "../modules/drawning.js";

let field = new Field("canvas_field", "div_field");

function click(event) {
    let position = field.getUserClickPosition(event);

    field.createObject(position, "Circle", 30, "pink", 0);

    field.display();
}

field.canvas.addEventListener("mousedown", function(event) {
    click(event);
})