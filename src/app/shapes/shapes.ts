import { Graphics } from "pixi.js";
import { DashLine } from 'pixi-dashed-line/lib/index'

export interface Selectable {
    selected: boolean;
}

export interface Refreshable {
    draw();
}

export class Cursor extends Graphics implements Refreshable {
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

export class Box extends Graphics implements Refreshable, Selectable {
    selected = false;

    constructor(public x: number,
                public y: number,
                public width2: number,
                public height2: number) {
        super();
        this.draw();
    }

    draw() {
        this.clear();
        this.beginFill(0xEEEEEE);
        this.lineStyle(2, 0x333333);
        this.drawRect(0, 0, this.width2, this.height2);

        if (this.selected) {
            const dash = new DashLine(this, {
                dash: [5, 5],
                width: 2,
                color: 0x000000,
            })

            dash.moveTo(-5, -5)
                .lineTo(this.width2+5, -5)
                .lineTo(this.width2+5, this.height2+5)
                .lineTo(-5, this.height2+5)
                .lineTo(-5, -5);
        }
    }

}