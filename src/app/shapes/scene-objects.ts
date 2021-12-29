import {Graphics, Text} from "pixi.js";
import {DashLine} from 'pixi-dashed-line/lib/index'

export enum Direction {
    North, South, East, West
}

export abstract class SceneObject extends Graphics {
    static idGenerator = 0;
    public oid = SceneObject.idGenerator++;
    public selected = false;

    protected constructor(public canContainText = false) {
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
        this.clear();
        if (this.selected) {
            const dash = new DashLine(this, {
                dash: [5, 5],
                width: 2,
                color: 0x000000,
            });
            dash.moveTo(this.sx, this.sy)
                .lineTo(this.ex, this.ey);
        }
        else {
            this.lineStyle(2, 0x333333)
                .moveTo(this.sx, this.sy)
                .lineTo(this.ex, this.ey);
        }

        this.drawArrowAt(this.ex, this.ey, (this.sx - this.ex), (this.sy - this.ey), 10);
    }

    drawArrowAt(px:number, py:number, dx:number, dy:number, size: number) {
        const cos = 0.866;
        const sin = 0.500;
        dx=size*(dx / Math.sqrt(dx*dx+dy*dy));
        dy=size*(dy / Math.sqrt(dx*dx+dy*dy));
        this.moveTo(px, py)
            .lineTo(px + (dx * cos + dy * -sin), py + (dx * sin + dy * cos))
            .moveTo(px, py)
            .lineTo(px + (dx * cos + dy * sin), py + (dx * -sin + dy * cos));
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

export class Label extends SceneObject{
    private pixiText: Text;

    constructor(public px: number,
                public py: number,
                public text: string) {
        super();
        this.position.set(px, py);
    }

    draw() {
    }

    onTextChange(text: string) {
        this.removeChildren();
        this.pixiText = new Text(text, {fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'});
        this.addChild(this.pixiText);
        this.draw();
    }
}

export class Box extends SceneObject {
    public extendable = true;

    private readonly extensionPointNorth: ExtensionPoint;
    private readonly extensionPointSouth: ExtensionPoint;
    private readonly extensionPointWest: ExtensionPoint;
    private readonly extensionPointEast: ExtensionPoint;

    constructor(public px: number,
                public py: number,
                public width2: number,
                public height2: number,
                public selected: boolean) {
        super(true);
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