import {Container, Graphics, DisplayObject} from "pixi.js";
import {Cursor} from "./shapes/cursor";
import {SceneObject} from "./shapes/scene-objects";


export class Scene extends Container {

    private readonly screenWidth: number;
    private readonly screenHeight: number;
    public readonly cursorElement;

    constructor(screenWidth: number, screenHeight: number) {
        super();
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        this.sortableChildren = true;
        this.cursorElement = new Cursor(
            (this.screenWidth/2)-((this.screenWidth/2)%20),
            (this.screenHeight/2)-((this.screenHeight/2)%20))
        this.cursorElement.zIndex = 99;

        this.addChild(this.cursorElement);

        var grid = new Graphics();
        grid.lineStyle(0, 0x0000FF, 1);
        grid.beginFill(0x666666, 1);
        for (let x = 0; x < screenWidth; x+=20) {
            for (let y = 0; y < screenWidth; y+=20) {
                grid.drawRect(x, y, 1, 1);
            }
        }
        this.addChild(grid);
    }

    public findSceneObjectAtCursor(): SceneObject {
        for (let i = this.children.length - 1; i >= 0; i--) {
            const displayObject = this.children[i];
            if (('selected' in displayObject) &&
                (displayObject as DisplayObject).getBounds().contains(this.cursorElement.x, this.cursorElement.y)) {
                return displayObject;
            }
        }
        return null;
    }
}