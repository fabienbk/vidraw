import {Graphics} from "pixi.js";

export class Cursor extends Graphics {
    constructor(public x: number,
                public y: number) {
        super();
        this.draw();
    }

    public draw() {
        this.clear();
        this.lineStyle(5, 0x00FF00);
        this.moveTo(0, 0)
            .lineTo(10, 0)
            .moveTo(0, 0)
            .lineTo(-10, 0)
            .moveTo(0, 0)
            .lineTo(0, 10)
            .moveTo(0, 0)
            .lineTo(0, -10);
    }
}

export class Box extends Graphics {
    constructor(public x: number,
                public y: number,
                public width2: number,
                public height2: number) {
        super();

        this.beginFill(0xFFFF00);
        this.lineStyle(2, 0xFF0000);
        this.drawRect(0, 0, this.width2, this.height2);
    }
}