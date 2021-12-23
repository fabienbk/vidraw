import * as PIXI from 'pixi.js';
import {CommandManager} from "./commandManager";
import {Scene} from "./scene";
import {Box} from "./shapes/shapes";


export class ViDrawApp {

    private app: PIXI.Application;
    private commandManager: CommandManager;
    private scene: Scene;

    constructor(parent: HTMLElement, width: number, height: number) {
        this.app = new PIXI.Application({width, height, backgroundColor : 0xFFFFFF});
        document.body.appendChild(this.app.view);

        this.scene = new Scene(width, height);
        this.commandManager = new CommandManager(this.scene);
        this.app.stage.addChild(this.scene);

        document.addEventListener('keypress', (keyEvent: KeyboardEvent) => this.commandManager.sendKey(keyEvent));
    }

}
