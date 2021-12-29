import {Arrow, Box, Direction, Label, SceneObject} from "../shapes/scene-objects";
import {CommandManager, InputMode} from "../commandManager";

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

export class InsertTextCommand extends Command{
    private label: Label;
    execute(commandManager: CommandManager) {
        commandManager.setEditMode();

        const textArea = document.createElement("textarea");
        textArea.setAttribute("cols", "200");
        textArea.setAttribute("id", "textarea-id")
        document.getElementById("hiddenInput").append(textArea);
        textArea.focus({ preventScroll: true });

        // Get selected object
        var sceneObjects = commandManager.scene
            .findObjects(o => o.selected && o.canContainText);

        if (sceneObjects.length == 0) {
            return;
        }
        const hostObject = sceneObjects[0];

        const label = new Label(hostObject.x + 10, hostObject.y + 10, "");
        commandManager.scene.addChild(label);

        textArea.addEventListener('input', (e: Event) => {
            label.onTextChange((e.target as HTMLTextAreaElement).value);
        });
        textArea.addEventListener('keydown', (keyEvent: KeyboardEvent) => {
            if (keyEvent.key === "Escape") {
                commandManager.setCommandMode();
                textArea.remove();
                keyEvent.stopPropagation();
                keyEvent.preventDefault();
            }
        });
    }

    undo(commandManager: CommandManager) {
        commandManager.scene.removeChild(this.label);
    }
}

export class ExtendShape extends Command {
    constructor(private direction: Direction) {
        super();
    }

    execute(commandManager: CommandManager) {
        var sceneObjects = commandManager.scene.allObjects()
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

            let newShapeX, newShapeY;
            if (this.direction == Direction.East) {newShapeX=parentObject.position.x + arrow.width + 200; newShapeY=parentObject.position.y}
            if (this.direction == Direction.North) {newShapeX=parentObject.position.x; newShapeY=parentObject.position.y - arrow.height - 80}
            if (this.direction == Direction.South) {newShapeX=parentObject.position.x; newShapeY=parentObject.position.y + 80 + arrow.height}
            if (this.direction == Direction.West) {newShapeX=parentObject.position.x - arrow.width - 200; newShapeY=parentObject.position.y}

            const box = new Box(newShapeX, newShapeY, 200, 80, false);
            commandManager.scene.addChild(box);
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
        this.sceneObjects = commandManager.scene.allObjects();
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

export class SelectNext extends Command {
    private first: SceneObject;
    private next: SceneObject;

    execute(commandManager: CommandManager) {
        var sceneObjects = commandManager.scene.allObjects().sort((o1, o2) => o1.oid-o2.oid);
        this.first = sceneObjects.find(o => o.selected);

        if (this.first) {
            this.first.selected = false;

            this.next = sceneObjects.find(o => o.oid > this.first.oid)
            if (!this.next) {
                this.next=sceneObjects[0];
            }

            this.next.selected = true;
        }

        this.first.draw();
        this.next.draw();
    }

    undo(commandManager: CommandManager) {

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
        this.allSelected = commandManager.scene.allObjects().filter(c => c.selected);
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