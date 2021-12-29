import {Scene} from "./scene";
import {
    Command,
    ExtendShape,
    InsertCommand, InsertTextCommand,
    MoveCursorCommand,
    MoveSelectedCommand,
    RedoCommand,
    SelectAllCommand,
    SelectCommand, SelectNext,
    UndoCommand
} from "./commands/commands";
import {Direction} from "./shapes/scene-objects";

type CommandToken = string;

export enum InputMode {
    Commands, TextEditing
}

export class CommandManager {

    private readonly pressListener = (keyEvent: KeyboardEvent) => this.sendKey(keyEvent);
    private readonly downListener = (keyEvent: KeyboardEvent) => this.sendKeyDown(keyEvent);

    private commands: {[k: string]: () => Command} = {
        'i': () => new InsertCommand(),
        't': () => new InsertTextCommand(),

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
    private inputMode = InputMode.Commands;

    constructor(public scene: Scene) {
        this.setCommandMode();
    }

    private buffer: CommandToken[] = [];

    clear() {
        this.buffer = [];
    }

    sendKeyDown(keyEvent: KeyboardEvent) {


        let passThrough = false;

        switch(keyEvent.key) {
            case "ArrowUp":
                this.runCommand(new MoveCursorCommand(0, -20));break;
            case "ArrowDown":
                this.runCommand(new MoveCursorCommand(0, 20));break;
            case "ArrowLeft":
                this.runCommand(new MoveCursorCommand(-20, 0));break;
            case "ArrowRight":
                this.runCommand(new MoveCursorCommand(20, 0));break;
            case "Tab":
                this.runCommand(new SelectNext());break;
            default:
                passThrough = true;
        }

        if (!passThrough)
            keyEvent.preventDefault();
    }

    sendKey(keyEvent: KeyboardEvent) {
        if (this.inputMode !== InputMode.Commands)
            return;

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
            case 't':
                keyEvent.preventDefault();
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

    public installKeyListeners() {
        document.addEventListener('keypress', this.pressListener);
        document.addEventListener('keydown', this.downListener);
    }

    public removeKeyListeners() {
        document.removeEventListener('keypress', this.pressListener);
        document.removeEventListener('keydown', this.downListener);
    }

    public setEditMode() {
        this.inputMode = InputMode.TextEditing;
        this.removeKeyListeners();
    }

    public setCommandMode() {
        this.inputMode = InputMode.Commands;
        this.installKeyListeners();
    }
}