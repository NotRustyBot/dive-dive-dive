import { BaseObject } from "./baseObject";
import { SerialisedComponent, commonDatatype } from "./component";
import { datatype } from "./datagram";
import { Hitbox } from "./hitbox";
import { NetComponent } from "./netComponent";
import { ObjectScope } from "./objectScope";
import { Physics } from "./physics";
import { Vector, Vectorlike } from "./types";

export type SerialisedFishBehaviour = {
    physics: number;
    hitbox: number;
    control: Vectorlike;
    food: number;
};

export type SerialisedFishBehaviourComponent = SerialisedFishBehaviour & SerialisedComponent;

export class FishBehaviour extends NetComponent {
    physics!: Physics;
    hitbox!: Hitbox;
    control: Vector = new Vector();
    food = 0;

    static override datagramDefinition(): void {
        super.datagramDefinition();
        this.datagram = this.datagram.cloneAppend<SerialisedFishBehaviour>({
            physics: commonDatatype.compId,
            hitbox: commonDatatype.compId,
            control: datatype.vector32,
            food: datatype.float32,
        });
    }

    constructor(parent: BaseObject, id: number) {
        super(parent, id);
        ObjectScope.game.subscribe("update", this);
        ObjectScope.game.subscribe("post-collision", this);
    }

    ["update"](dt: number) {
        const s = dt / 60;
        this.food -= 0.01 * s;
        this.control.add(Vector.fromAngle(Math.random() * Math.PI * 2).mult(0.1));
        this.control.normalize();
        this.parent.rotation = this.physics.velocity.toAngle();
        this.physics.velocity.add(this.control.result().normalize());
        this.physics.velocity.mult(0.5);
        this.invalidateCache();
    }

    ["post-collision"](dt: number) {
        for (const [layer, overlaps] of this.hitbox.overlaps) {
            for (const overlap of overlaps) {
                let useOffset = new Vector();
                if (Math.abs(overlap.offset.x) > Math.abs(overlap.offset.y)) {
                    useOffset.y = overlap.offset.y;
                    this.physics.velocity.y = 0;
                } else {
                    useOffset.x = overlap.offset.x;
                    this.physics.velocity.x = 0;
                }
                this.control.set(0, 0);
                this.parent.position.add(useOffset);
                this.parent.transform.invalidateCache();
            }
        }
        this.invalidateCache();
    }

    override onRemove(): void {
        super.onRemove();
        ObjectScope.game.unsubscribe("update", this);
        ObjectScope.game.unsubscribe("post-collision", this);
    }

    override toSerialisable(): SerialisedFishBehaviourComponent {
        const data = super.toSerialisable() as SerialisedFishBehaviourComponent;
        data.physics = this.physics.id;
        data.hitbox = this.hitbox.id;
        data.control = this.control.toLike();
        data.food = this.food;
        return data;
    }

    override fromSerialisable(data: SerialisedFishBehaviourComponent) {
        super.fromSerialisable(data);
        this.physics = this.parent.getComponent(data.physics);
        this.hitbox = this.parent.getComponent(data.hitbox);
        this.control = Vector.fromLike(data.control);
        this.food = data.food;
    }
}
