import {Graphics} from "pixi.js";
import {DashLine} from 'pixi-dashed-line/lib/index'

enum Direction {
    North, South, East, West
}

export abstract class SceneObject extends Graphics {
    static idGenerator = 0;
    public id = SceneObject.idGenerator++;
    public selected = false;

    protected constructor() {
        super();
    }

    public abstract draw();
}

export class Arrow extends SceneObject {
    constructor(public sx: number,
                public sy: number,
                public ex: number,
                public ey: number) {
        super();
        this.draw();
    }

    draw() {
        this.moveTo(this.sx, this.sy).lineTo(this.ex, this.ey);
    }
}

export class ExtensionPoint extends SceneObject {
    constructor(public px: number,
                public py: number,
                public direction: Direction) {
        super();
        this.position.set(px, py);
        this.draw();
    }

    draw() {
        this.clear();
        this.lineStyle(2, 0x333333).beginFill(0xEEEEEE)
            .drawCircle(0, 0, 10);

        switch (this.direction) {
            case Direction.North:
                this.moveTo(0, 5).lineTo(0, -5).lineTo(0 - 5, -2).moveTo(0, -5).lineTo(5, -2);
                break;
            case Direction.South:
                this.moveTo(0, 0 - 5).lineTo(0, 5).lineTo(0 - 5, 2).moveTo(0, 5).lineTo(5, 2);
                break;
            case Direction.West:
                this.moveTo(5, 0).lineTo(-5, 0).lineTo(0, 0 - 5).moveTo(-5, 0).lineTo(0, 5);
                break;
            case Direction.East:
                this.moveTo(0 - 5, 0).lineTo(5, 0).lineTo(0, 0 - 5).moveTo(5, 0).lineTo(0, 5);
        }
    }
}

export class Box extends SceneObject {
    constructor(public px: number,
                public py: number,
                public width2: number,
                public height2: number) {
        super();
        this.position.set(px, py);

        this.addChild(new ExtensionPoint(this.width2/2, 0, Direction.North));
        this.addChild(new ExtensionPoint(this.width2/2, this.height2, Direction.South));
        this.addChild(new ExtensionPoint(0, this.height2/2, Direction.West));
        this.addChild(new ExtensionPoint(this.width2, this.height2/2, Direction.East));

        this.draw();
    }

    draw() {
        this.clear();

        this.beginFill(0xEEEEEE)
            .lineStyle(2, 0x333333)
            .drawRect(0, 0, this.width2, this.height2);

        if (this.selected) {
            const dash = new DashLine(this, {
                dash: [5, 5],
                width: 2,
                color: 0x000000,
            })

            dash.moveTo(-5, -5)
                .lineTo(this.width2 + 5, -5)
                .lineTo(this.width2 + 5, this.height2 + 5)
                .lineTo(-5, this.height2 + 5)
                .lineTo(-5, -5);
        }
    }

}