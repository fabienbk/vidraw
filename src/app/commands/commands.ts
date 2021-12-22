import {Scene} from "../scene";
import {Box} from "../shapes/shapes";

export abstract class Command {
    abstract execute(scene: Scene);
}

export class InsertCommand extends Command{
    execute(scene: Scene) {
        scene.addChild(new Box(scene.cursorElement.x,scene.cursorElement.y, 200, 80))
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
