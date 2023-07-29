import { Vector, Vectorlike } from "../types";
import { BaseObject } from "../baseObject";
import { Hitbox } from "../hitbox";


export type RectInAreas = { position: Vector, x1: number, y1: number, x2: number, y2: number, inAreas: Set<Area>, parent: BaseObject }

//#region server
export class Layer {
    static list = new Map<number, Layer>();
    static index = 0;
    areas: Map<number, Area>;
    id: number;
    size = 1000;
    constructor() {
        this.areas = new Map();
        this.id = Layer.index;
        Layer.list.set(Layer.index++, this);
    }

    static getById(id: number): Layer {
        const layer = this.list.get(id);
        if (layer) return layer;
        throw "no layer with this id"
    }

    addObject(rect: RectInAreas) {
        for (let x = this.toGridAxis(rect.x1); x <= this.toGridAxis(rect.x2); x++) {
            for (let y = this.toGridAxis(rect.y1); y <= this.toGridAxis(rect.y2); y++) {
                let gridCoords = { x, y };
                let gridIndex = Layer.toGridIndex(gridCoords);
                let area = this.areas.get(gridIndex);
                if(!area){
                    area = new Area(this, gridCoords);
                    this.areas.set(gridIndex, area);
                }
                area.members.add(rect);
                rect.inAreas.add(area);
            }
        }
    }

    removeObject(physicsObject: RectInAreas) {
        for (const area of physicsObject.inAreas) {
            area.members.delete(physicsObject);
        }
        physicsObject.inAreas.clear();
    }

    getObjects(position: Vectorlike) {
        return this.getObjectsByGrid(this.toGrid(position));
    
    }

    getObjectsByGrid(grid: Vectorlike) {
        let area = this.areas.get(Layer.toGridIndex(grid));
        if (area == undefined) return new Set<RectInAreas>();
        return area.members;
    }

    getNearbyObjects(position: Vector, range: number) {
        const result: Array<Set<RectInAreas>> = [];
        for (let x = this.toGridAxis(position.x - range); x <= this.toGridAxis(position.x + range); x++) {
            for (let y = this.toGridAxis(position.y - range); y <= this.toGridAxis(position.y + range); y++) {
                result.push(this.getObjectsByGrid({ x, y }));
            }
        }
        return result;
    }

    moveObject(rect: RectInAreas, position: Vector) {
        const orig = rect.position;
        const offset = position.diff(orig);
        let updateRequired =
            this.toGridAxis(rect.x1) != this.toGridAxis(rect.x1 + offset.x) ||
            this.toGridAxis(rect.y1) != this.toGridAxis(rect.y1 + offset.y) ||
            this.toGridAxis(rect.x2) != this.toGridAxis(rect.x2 + offset.x) ||
            this.toGridAxis(rect.y2) != this.toGridAxis(rect.y2 + offset.y)


        if (updateRequired) {
            this.removeObject(rect);
            rect.position.set(position.x, position.y)
            this.addObject(rect);
        } else {
            rect.position.set(position.x, position.y)
        }
    }

    toGridAxis(scalar: number): number {
        return Math.floor(scalar / this.size);
    }

    toGrid(position: Vectorlike): Vector {
        return new Vector(this.toGridAxis(position.x), this.toGridAxis(position.y));
    }

    static toGridIndex(vector: Vectorlike): number {
        return ((vector.x & 0xffff) << 16) | (vector.y & 0xffff);
    }
}

export class Area {
    members: Set<RectInAreas> = new Set();
    gridPosition: Vector;
    positionIndex: number;
    layer: Layer;
    constructor(layer: Layer, position: Vectorlike) {
        this.gridPosition = new Vector(position.x, position.y);
        this.positionIndex = Layer.toGridIndex(this.gridPosition);
        this.layer = layer;
        layer.areas.set(this.positionIndex, this);
    }

    addObject(physicsObject: RectInAreas) {
        this.members.add(physicsObject);
        physicsObject.inAreas.add(this);
    }

    removeObject(physicsObject: RectInAreas) {
        this.members.delete(physicsObject);
        physicsObject.inAreas.delete(this);
    }
}

//#endregion server
