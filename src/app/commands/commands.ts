import {Arrow, Box, Direction, SceneObject} from "../shapes/scene-objects";
import {CommandManager} from "../commandManager";

export abstract class Command {
    public transient = false;
    abstract execute(commandManager: CommandManager);
    abstract undo(commandManager: CommandManager);
}

export class InsertCommand extends Command{
    private newShape: SceneObject;
    execute(commandManager: CommandManager) {
        const scene = commandManager.scene;
        const existingSceneObject = scene.findSceneObjectAtCursor();
        if (!existingSceneObject) {
            const box = new Box(scene.cursorElement.x, scene.cursorElement.y, 200, 80, true);
            this.newShape = box;
            scene.addChild(box);
        }
    }

    undo(commandManager: CommandManager) {
        commandManager.scene.removeChild(this.newShape);
    }
}

export class ExtendShape extends Command {
    constructor(private direction: Direction) {
        super();
    }

    execute(commandManager: CommandManager) {
        var sceneObjects = commandManager.scene.allChildren()
            .filter(o => o.selected)
            .filter(o => 'extendable' in o);

        if (sceneObjects.length > 0) {
            const sceneObject = sceneObjects[0];
            const parentObject = sceneObject as Box;
            const extensionPoint = parentObject.getExtensionPoint(this.direction);

            let sx = extensionPoint.position.x + parentObject.position.x;
            let ex = sx;
            let sy = extensionPoint.position.y + parentObject.position.y;
            let ey = sy;

            if (this.direction == Direction.East) ex+= parentObject.width2/2;
            if (this.direction == Direction.North) ey-= parentObject.height2/2;
            if (this.direction == Direction.South) ey+= parentObject.height2/2;
            if (this.direction == Direction.West) ex-= parentObject.width2/2;

            const arrow = new Arrow(sx, sy, ex, ey);
            commandManager.scene.addChild(arrow);
        }
    }

    undo(commandManager: CommandManager) {
    }

}

export class SelectCommand extends Command {
    private sceneObject: SceneObject;
    execute(commandManager: CommandManager) {
        this.sceneObject = commandManager.scene.findSceneObjectAtCursor();
        if (this.sceneObject) {
            this.sceneObject.selected = !this.sceneObject.selected;
            this.sceneObject.draw();
        }
    }

    undo(commandManager: CommandManager) {
        if (this.sceneObject) {
            this.sceneObject.selected = !this.sceneObject.selected;
            this.sceneObject.draw();
        }
    }
}

export class SelectAllCommand extends Command {
    private sceneObjects: SceneObject[];
    execute(commandManager: CommandManager) {
        this.sceneObjects = commandManager.scene.allChildren();
        this.sceneObjects.forEach(o => {
            o.selected = true
            o.draw();
        });
    }

    undo(commandManager: CommandManager) {
        this.sceneObjects.forEach(o => {
            o.selected = false;
            o.draw();
        });
    }
}


export class MoveCursorCommand extends Command {
    constructor(private xDelta:number, private yDelta:number) {
        super();
    }

    execute(commandManager: CommandManager) {
        const scene = commandManager.scene;
        scene.cursorElement.x += this.xDelta;
        scene.cursorElement.y += this.yDelta;
    }

    undo(commandManager: CommandManager) {
        const scene = commandManager.scene;
        scene.cursorElement.x -= this.xDelta;
        scene.cursorElement.y -= this.yDelta;
    }
}


export class MoveSelectedCommand extends Command {
    private allSelected: SceneObject[];
    constructor(private xDelta:number, private yDelta:number) {
        super();
    }

    execute(commandManager: CommandManager) {
        this.allSelected = commandManager.scene.allChildren().filter(c => c.selected);
        this.allSelected.forEach(o => {
            o.position.x += this.xDelta;
            o.position.y += this.yDelta;
        });
    }

    undo(commandManager: CommandManager) {
        this.allSelected.forEach(o => {
            o.position.x -= this.xDelta;
            o.position.y -= this.yDelta;
        });
    }
}


export class UndoCommand extends Command {
    public transient = true;
    execute(commandManager: CommandManager) {
        if (commandManager.history.length > 0 && commandManager.historyPointer > -1) {
            commandManager.history[commandManager.historyPointer].undo(commandManager);
            commandManager.historyPointer--;
        }
    }

    undo(commandManager: CommandManager) {
    }
}

export class RedoCommand extends Command {
    public transient = true;
    execute(commandManager: CommandManager) {
        if (commandManager.historyPointer < commandManager.history.length - 1) {
            commandManager.historyPointer++;
            commandManager.history[commandManager.historyPointer].execute(commandManager);
        }
    }

    undo(commandManager: CommandManager) {
    }
}