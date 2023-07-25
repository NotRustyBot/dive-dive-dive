import { Vector } from "../types";
import { BaseObject } from "../baseObject";
import { Hitbox } from "../hitbox";

//#region server
export class Layer {
    static list = new Map<number, Layer>();
    static index = 0;
    areas: Map<number, Area>;
    id: number;
    constructor() {
        this.areas = new Map();
        this.id = Layer.index;
        Layer.list.set(Layer.index, this);
    }

    static getById(id: number): Layer {
        const layer = this.list.get(id);
        if (layer) return layer;
        throw "no layer with this id"
    }

    static addObject(physicsObject: Hitbox) {
        let layer = physicsObject.layer;
        let gridCoords = Layer.toGrid(physicsObject.position);
        let gridIndex = Layer.toGridIndex(gridCoords);
        let area = layer.areas.get(gridIndex) || new Area(layer, gridCoords);
        area.members.add(physicsObject);
        physicsObject.inAreas.add(area);

        let s = physicsObject.size;
        if (s == 0) return;

        let top = false;
        let bottom = false;
        let left = false;
        let right = false;

        let pos = physicsObject.position;

        if (pos.x + s > area.gridPosition.x * Area.size + Area.size) {
            let thisGridCoords = new Vector(gridCoords.x + 1, gridCoords.y);
            gridIndex = Layer.toGridIndex(thisGridCoords);
            let thisArea = layer.areas.get(gridIndex) || new Area(layer, thisGridCoords);
            thisArea.addObject(physicsObject);
            right = true;
        }
        if (pos.y + s > area.gridPosition.y * Area.size + Area.size) {
            let thisGridCoords = new Vector(gridCoords.x, gridCoords.y + 1);
            gridIndex = Layer.toGridIndex(thisGridCoords);
            let thisArea = layer.areas.get(gridIndex) || new Area(layer, thisGridCoords);
            thisArea.addObject(physicsObject);
            top = true;
        }

        if (pos.x - s < area.gridPosition.x * Area.size) {
            let thisGridCoords = new Vector(gridCoords.x - 1, gridCoords.y);
            gridIndex = Layer.toGridIndex(thisGridCoords);
            let thisArea = layer.areas.get(gridIndex) || new Area(layer, thisGridCoords);
            thisArea.addObject(physicsObject);
            left = true;
        }
        if (pos.y - s < area.gridPosition.y * Area.size) {
            let thisGridCoords = new Vector(gridCoords.x, gridCoords.y - 1);
            gridIndex = Layer.toGridIndex(thisGridCoords);
            let thisArea = layer.areas.get(gridIndex) || new Area(layer, thisGridCoords);
            thisArea.addObject(physicsObject);
            bottom = true;
        }

        //corners

        if (top && right) {
            let thisGridCoords = new Vector(gridCoords.x + 1, gridCoords.y + 1);
            gridIndex = Layer.toGridIndex(thisGridCoords);
            area = layer.areas.get(gridIndex) || new Area(layer, thisGridCoords);
            area.addObject(physicsObject);
        }

        if (top && left) {
            let thisGridCoords = new Vector(gridCoords.x - 1, gridCoords.y + 1);
            gridIndex = Layer.toGridIndex(thisGridCoords);
            area = layer.areas.get(gridIndex) || new Area(layer, thisGridCoords);
            area.addObject(physicsObject);
        }

        if (bottom && right) {
            let thisGridCoords = new Vector(gridCoords.x + 1, gridCoords.y - 1);
            gridIndex = Layer.toGridIndex(thisGridCoords);
            area = layer.areas.get(gridIndex) || new Area(layer, thisGridCoords);
            area.addObject(physicsObject);
        }

        if (bottom && left) {
            let thisGridCoords = new Vector(gridCoords.x - 1, gridCoords.y - 1);
            gridIndex = Layer.toGridIndex(thisGridCoords);
            area = layer.areas.get(gridIndex) || new Area(layer, thisGridCoords);
            area.addObject(physicsObject);
        }
    }

    static removeObject(physicsObject: Hitbox) {
        for (const area of physicsObject.inAreas) {
            area.members.delete(physicsObject);
        }
        physicsObject.inAreas.clear();
    }

    static getObjects(layer: Layer, position: Vector) {
        let area = layer.areas.get(Layer.toGridIndex(Layer.toGrid(position)));
        if (area == undefined) return new Set();
        return area.members;
    }

    static moveObject(physicsObject: Hitbox, position: Vector) {
        const orig = physicsObject.position;
        let updateRequired = false;
        for (let i = 0; i < 4; i++) {
            const vect = physicsObject.boundOffsets[i];
            if (
                this.toGridAxis(orig.x + vect.x) != this.toGridAxis(position.x + vect.x) ||
                this.toGridAxis(orig.y + vect.y) != this.toGridAxis(position.y + vect.y)
            ) {
                updateRequired = true;
                break;
            }
        }

        if (updateRequired) {
            Layer.removeObject(physicsObject);
            physicsObject.position = position;
            Layer.addObject(physicsObject);
        } else {
            physicsObject.position = position;
        }
    }

    static toGridAxis(scalar: number): number {
        return Math.floor(scalar / Area.size);
    }

    static toGrid(position: Vector): Vector {
        return new Vector(Layer.toGridAxis(position.x), Layer.toGridAxis(position.y));
    }

    static toGridIndex(vector: Vector): number {
        return ((vector.x & 0xffff) << 16) | (vector.y & 0xffff);
    }
}

export class Area {
    members: Set<Hitbox> = new Set();
    gridPosition: Vector;
    positionIndex: number;
    layer: Layer;
    constructor(layer: Layer, position: Vector) {
        this.gridPosition = new Vector(position.x, position.y);
        this.positionIndex = Layer.toGridIndex(this.gridPosition);
        this.layer = layer;
        layer.areas.set(this.positionIndex, this);
    }

    addObject(physicsObject: Hitbox) {
        this.members.add(physicsObject);
        physicsObject.inAreas.add(this);
    }

    removeObject(physicsObject: Hitbox) {
        this.members.delete(physicsObject);
        physicsObject.inAreas.delete(this);
    }

    static size = 1000;
}

//#endregion server
