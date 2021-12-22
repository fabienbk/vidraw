import {Container, Graphics} from "pixi.js";
import {Box, Cursor} from "./shapes/shapes";

export class Scene extends Container {

    private readonly screenWidth: number;
    private readonly screenHeight: number;
    public readonly cursorElement;

    constructor(screenWidth: number, screenHeight: number) {
        super();
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        this.sortableChildren = true;
        this.cursorElement = new Cursor(this.screenWidth/2, this.screenHeight/2)
        this.cursorElement.zIndex = 99;

        this.addChild(this.cursorElement);
    }
}