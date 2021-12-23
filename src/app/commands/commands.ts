import {Box, SceneObject} from "../shapes/scene-objects";
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
            const box = new Box(scene.cursorElement.x, scene.cursorElement.y, 200, 80);
            this.newShape = box;
            scene.addChild(box);
        }
    }

    undo(commandManager: CommandManager) {
        commandManager.scene.removeChild(this.newShape);
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