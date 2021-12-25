import {Scene} from "./scene";
import {
    Command,
    ExtendShape,
    InsertCommand,
    MoveCursorCommand,
    MoveSelectedCommand,
    RedoCommand,
    SelectAllCommand,
    SelectCommand,
    UndoCommand
} from "./commands/commands";
import {Direction} from "./shapes/scene-objects";

type CommandToken = string;

export class CommandManager {

    private commands: {[k: string]: () => Command} = {
        'i': () => new InsertCommand(),

        's': () => new SelectCommand(),
        'S': () => new SelectAllCommand(),

        'u': () => new UndoCommand(),
        'U': () => new RedoCommand(),

        'h': () => new ExtendShape(Direction.West),
        'j': () => new ExtendShape(Direction.South),
        'k': () => new ExtendShape(Direction.North),
        'l': () => new ExtendShape(Direction.East),

        'H': () => new MoveSelectedCommand(-20, 0),
        'J': () => new MoveSelectedCommand(0, -20),
        'K': () => new MoveSelectedCommand(0, 20),
        'L': () => new MoveSelectedCommand(20, 0),
    }

    public history: Array<Command> = [];
    public historyPointer = -1;

    constructor(public scene: Scene) {
    }

    private buffer: CommandToken[] = [];

    clear() {
        this.buffer = [];
    }

    sendKeyDown(keyEvent: KeyboardEvent) {
        switch(keyEvent.key) {
            case "ArrowUp":
                this.runCommand(new MoveCursorCommand(0, -20));break;
            case "ArrowDown":
                this.runCommand(new MoveCursorCommand(0, 20));break;
            case "ArrowLeft":
                this.runCommand(new MoveCursorCommand(-20, 0));break;
            case "ArrowRight":
                this.runCommand(new MoveCursorCommand(20, 0));break;
        }
    }

    sendKey(keyEvent: KeyboardEvent) {
        console.log(keyEvent);
        switch (keyEvent.key) {
            case 'Escape':
                this.clear();break;
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.buffer.push(keyEvent.key as CommandToken);break;
            default:
            {
                this.buffer.push(keyEvent.key as CommandToken);
                this.interpret();
                break;
            }
        }
    }

    private interpret() {
        const commandString = this.buffer.join("");
        const regex = /^([0-9]*)([\w])$/;
        const matchArray = commandString.match(regex);

        console.log("command='" + commandString);

        if (!matchArray || matchArray.length === 0)
            return;

        console.log("command='" + commandString + "' array("+matchArray.length+")=[" + matchArray+"]");

        const cardinality = matchArray[1] === '' ? 1 : Number.parseInt(matchArray[1]);
        const command = matchArray[2];
        const commandObj = this.commands[command];

        if (commandObj === undefined) {
            this.clear();
            return;
        }
        else {
            for (let i = 0; i < cardinality; i++) {
                const commandInstance = commandObj();
                this.runCommand(commandInstance);
            }
            this.clear();
        }
    }

    private runCommand(commandInstance: Command) {
        if (!commandInstance.transient) {
            this.historyPointer++;
            this.history[this.historyPointer] = commandInstance;
        }

        commandInstance.execute(this);
    }
}