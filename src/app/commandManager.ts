import {Scene} from "./scene";
import {Command, InsertCommand, MoveCursorCommand, SelectCommand} from "./commands/commands";

type CommandToken = string;

export class CommandManager {

    private commands: {[k: string]: Command} = {
        'i': new InsertCommand(),
        's': new SelectCommand(),
        'h': new MoveCursorCommand(-20, 0),
        'j': new MoveCursorCommand(0, 20),
        'k': new MoveCursorCommand(0, -20),
        'l': new MoveCursorCommand(20, 0),
    }

    constructor(private scene: Scene) {
    }

    private buffer: CommandToken[] = [];

    clear() {
        this.buffer = [];
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
                commandObj.execute(this.scene);
            }
            this.clear();
        }
    }
}