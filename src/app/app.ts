import * as PIXI from 'pixi.js';
import {CommandManager} from "./commandManager";
import {Scene} from "./scene";

export class ViDrawApp {

    private readonly app: PIXI.Application;
    private readonly commandManager: CommandManager;
    private readonly scene: Scene;

    constructor(parent: HTMLElement, width: number, height: number) {
        this.app = new PIXI.Application({width, height, backgroundColor : 0xFFFFFF});
        document.body.appendChild(this.app.view);

        this.scene = new Scene(width, height);
        this.commandManager = new CommandManager(this.scene);
        this.app.stage.addChild(this.scene);

        document.addEventListener('keypress', (keyEvent: KeyboardEvent) => this.commandManager.sendKey(keyEvent));
        document.addEventListener('keydown', (keyEvent: KeyboardEvent) => this.commandManager.sendKeyDown(keyEvent));
    }

}
