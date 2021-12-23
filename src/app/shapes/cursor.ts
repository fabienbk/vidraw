import {Graphics} from "pixi.js";

export class Cursor extends Graphics {
    constructor(public x: number,
                public y: number) {
        super();
        this.draw();
    }

    public draw() {
        this.clear();
        this.lineStyle(3, 0x000000);
        this.moveTo(0, 0)
            .lineTo(15, 0)
            .moveTo(0, 0)
            .lineTo(-15, 0)
            .moveTo(0, 0)
            .lineTo(0, 15)
            .moveTo(0, 0)
            .lineTo(0, -15);
    }
}