import { NetComponent, Serialisable, SerialisedComponent } from "./netComponent";
import { Area, Layer, RectInAreas } from "./physics/chunks";
import { Vector, Vectorlike } from "./types";
import { BaseObject } from "./baseObject";
import { datatype } from "./datagram";


export type SerialisedHitbox = {
    x: number;
    y: number;
    w: number;
    h: number;
    layer: number;
};
export type SerialisedHitboxComponent = SerialisedHitbox & SerialisedComponent;

export type Overlap = {
    offset: Vectorlike;
    with: RectInAreas;
}

export class Hitbox extends NetComponent {
    inAreas = new Set<Area>();
    boundOffsets: Array<Vectorlike> = [];
    size = 0;
    layer!: Layer;
    sides = new Vector();
    offset = new Vector();
    overlaps: Array<Overlap> = [];
    position = new Vector();
    layerId!: number;

    public get x1(): number {
        return this.position.x + this.offset.x - this.sides.x / 2
    }

    public get x2(): number {
        return this.position.x + this.offset.x + this.sides.x / 2
    }

    public get y1(): number {
        return this.position.y + this.offset.y - this.sides.y / 2
    }

    public get y2(): number {
        return this.position.y + this.offset.y + this.sides.y / 2
    }

    static override datagramDefinition(): void {
        this.datagram = this.datagram.cloneAppend<SerialisedHitbox>({
            layer: datatype.uint8,
            x: datatype.float32,
            y: datatype.float32,
            w: datatype.float32,
            h: datatype.float32,
        });
    }



    constructor(parent: BaseObject, id: number) {
        super(parent, id);
    }

    override onRemove(): void {
        this.layer.removeObject(this);
    }

    setLayer(layer: Layer) {
        this.layer = layer;
        this.layer.addObject(this);
        this.invalidateCache();
    }

    move() {
        this.layer.moveObject(this, this.parent.position.result());
        this.checkCollisions();
        this.invalidateCache();
    }

    checkCollisions() {
        this.overlaps = [];
        const toCheck = new Set<RectInAreas>();
        for (const area of this.inAreas) {
            for (const box of area.members) {
                if (box == this) continue;
                toCheck.add(box);
            }
        }

        for (const box of toCheck) {
            this.checkAgainst(box);
        }
    }

    checkAgainst(that: RectInAreas) {
        const small_epsilon = 0;
        if (this.x1 < that.x2 && this.x2 > that.x1 &&
            this.y1 < that.y2 && this.y2 > that.y1) {
            const dx = Math.min(this.x2, that.x2) - Math.max(this.x1, that.x1);
            const dy = Math.min(this.y2, that.y2) - Math.max(this.y1, that.y1);
            const offset = new Vector();
            offset.x = (dx > 0) ? (dx + small_epsilon) : 0;
            offset.y = (dy > 0) ? (dy + small_epsilon) : 0;

            offset.x *= (this.x2 < that.x2) ? -1 : 1;
            offset.y *= (this.y2 < that.y2) ? -1 : 1;

            this.overlaps.push({ offset, with: that });
        }
    }

    isCoordInside(coord: Vectorlike) {
        if (this.x1 / 2 > coord.x) return false;
        if (this.x2 / 2 < coord.x) return false;
        if (this.y1 / 2 > coord.y) return false;
        if (this.y2 / 2 < coord.y) return false;
        return true
    }

    updateBounds() {
        this.boundOffsets[0] = { x: this.sides.x / 2 + this.offset.x, y: this.sides.y / 2 + this.offset.y };
        this.boundOffsets[1] = { x: this.sides.x / 2 + this.offset.x, y: -this.sides.y / 2 + this.offset.y };
        this.boundOffsets[2] = { x: -this.sides.x / 2 + this.offset.x, y: -this.sides.y / 2 + this.offset.y };
        this.boundOffsets[3] = { x: -this.sides.x / 2 + this.offset.x, y: this.sides.y / 2 + this.offset.y };

        this.size = 0;
        for (let i = 0; i < this.boundOffsets.length; i++) {
            const point = this.boundOffsets[i];
            this.size = Math.max(this.size, Vector.fromLike(point).length());
        }

        this.invalidateCache();
    }

    override toSerialisable(): SerialisedHitboxComponent {
        const data = super.toSerialisable() as SerialisedHitboxComponent;
        data.x = this.offset.x;
        data.y = this.offset.y;
        data.w = this.sides.x;
        data.h = this.sides.y;
        data.layer = this.layer.id;
        return data;
    }

    override fromSerialisable(data: SerialisedHitboxComponent): void {
        super.fromSerialisable(data);
        this.offset.set(data.x, data.y);
        this.sides.set(data.w, data.h);
        this.layerId = data.layer;
        this.init();
    }

    override init(): void {
        this.position = this.parent.position.result();  
        this.updateBounds();
        this.setLayer(Layer.getById(this.layerId));
        this.move();
    }
}

