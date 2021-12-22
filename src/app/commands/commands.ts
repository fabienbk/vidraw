import {Scene} from "../scene";
import {Box, Refreshable, Selectable} from "../shapes/shapes";

export abstract class Command {
    abstract execute(scene: Scene);
}

export class InsertCommand extends Command{
    execute(scene: Scene) {
        scene.addChild(new Box(scene.cursorElement.x,scene.cursorElement.y, 200, 80))
    }
}

export class SelectCommand extends Command {
    execute(scene: Scene) {
        const shape = scene.findShapeAtCursor();
        if ('selected' in shape) {
            (shape as Selectable).selected = !(shape as Selectable).selected;
            (shape as Refreshable).draw();
        }
    }
}

export class MoveCursorCommand extends Command {
    constructor(private xDelta:number, private yDelta:number) {
        super();
    }

    execute(scene: Scene) {
        scene.cursorElement.x += this.xDelta;
        scene.cursorElement.y += this.yDelta;
    }
}
