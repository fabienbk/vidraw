import {Graphics} from "pixi.js";
import {DashLine} from 'pixi-dashed-line/lib/index'

export enum Direction {
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
        this.lineStyle(2, 0x333333).beginFill(0xEEEEEE)
            .moveTo(this.sx, this.sy)
            .lineTo(this.ex, this.ey);
        this.drawArrowAt(this.ex, this.ey, (this.sx-this.ex), (this.sy-this.ey));
    }

    drawArrowAt(px:number, py:number, dx:number, dy:number) {
        const cos = 0.866;
        const sin = 0.500;
        dx=10*(dx / Math.sqrt(dx*dx+dy*dy));
        dy=10*(dy / Math.sqrt(dx*dx+dy*dy));
        const end1x = (px + (dx * cos + dy * -sin));
        const end1y = (py + (dx * sin + dy * cos));
        const end2x = (px + (dx * cos + dy * sin));
        const end2y = (py + (dx * -sin + dy * cos));
        this.moveTo(px, py)
            .lineTo(end1x, end1y)
            .moveTo(px, py)
            .lineTo(end2x, end2y);
    }

}

export class ExtensionPoint extends SceneObject {
    constructor(public px: number,
                public py: number,
                public direction: Direction,
                public parent: SceneObject) {
        super();
        this.position.set(px, py);
        this.draw();
    }

    draw() {
        this.clear();
        if (this.parent.selected) {
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
}

export class Box extends SceneObject {
    public extendable = true;
    private extensionPointNorth: ExtensionPoint;
    private extensionPointSouth: ExtensionPoint;
    private extensionPointWest: ExtensionPoint;
    private extensionPointEast: ExtensionPoint;
    constructor(public px: number,
                public py: number,
                public width2: number,
                public height2: number,
                public selected: boolean) {
        super();
        this.position.set(px, py);
        this.selected = selected;

        this.extensionPointNorth = new ExtensionPoint(this.width2/2, 0, Direction.North, this);
        this.extensionPointSouth = new ExtensionPoint(this.width2/2, this.height2, Direction.South, this);
        this.extensionPointWest = new ExtensionPoint(0, this.height2/2, Direction.West, this);
        this.extensionPointEast = new ExtensionPoint(this.width2, this.height2/2, Direction.East, this);
        this.addChild(this.extensionPointNorth, this.extensionPointWest, this.extensionPointEast, this.extensionPointSouth);
        this.draw();
    }

    getExtensionPoint(direction: Direction): ExtensionPoint {
        switch (direction) {
            case Direction.North: return this.extensionPointNorth;
            case Direction.South: return this.extensionPointSouth;
            case Direction.East: return this.extensionPointEast;
            case Direction.West: return this.extensionPointWest;
        }
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

        for (const child of this.children) {
            (child as ExtensionPoint).draw();
        }
    }

}