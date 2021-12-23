import {Scene} from "../scene";
import {Box, Refreshable, Selectable} from "../shapes/shapes";

export abstract class Command {
    public transient = false;
    abstract execute(scene: Scene);
    abstract undo(scene: Scene);
}

export class InsertCommand extends Command{
    private id: number;
    execute(scene: Scene) {
        var shape = scene.findSelectableShapeAtCursor();
        if (!shape) {
            var box = new Box(scene.cursorElement.x,scene.cursorElement.y, 200, 80);
            scene.addChild(box)
        }
    }

    undo(scene: Scene) {

    }
}

export class SelectCommand extends Command {
    private selectable: Selectable;
    private refreshable: Refreshable;
    execute(scene: Scene) {
        const shape = scene.findSelectableShapeAtCursor();
        if ('selected' in shape) {
            this.selectable = shape as Selectable;
            this.refreshable = shape as Refreshable;
            this.selectable.selected = !this.selectable.selected;
            this.refreshable.draw();
        }
    }

    undo(scene: Scene) {
        this.selectable.selected = !this.selectable.selected;
        this.refreshable.draw();
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

    undo(scene: Scene) {

    }
}

export class UndoCommand extends Command {
    public transient = true;
    execute(scene: Scene) {
    }
}