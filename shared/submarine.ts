import { Vector, Vectorlike } from "./types";
import { gravity } from "./constants";
import { Component, Serialisable, SerialisedComponent } from "./component";
import { SubStats } from "./stats";
import { BaseObject } from "./baseObject";
import { Physics } from "./physics";
import { Hitbox } from "./hitbox";
import { clamp } from "./utils";
import { datatype } from "./datagram";
import { ObjectScope } from "./objectScope";

export type SerialisedSubmarineBehaviour = {
    physics: number;
    hitbox: number;
    ballastWater: number;
    leakWater: number;
    leaking: number;
    control: Vectorlike;
}

export type SerialisedSubmarineBehaviourComponent = SerialisedSubmarineBehaviour & SerialisedComponent;

export class SubmarineBehaviour extends Component {
    control = new Vector();
    physics!: Physics;
    hitbox!: Hitbox;
    buoyancy = 0;
    cargoWeight = 0;
    stats = SubStats.defaultStats();
    ballastWater = 0;
    leakWater = 0;
    leaking = 0;

    public get ballastFill(): number {
        return this.ballastWater / this.stats.ballastVolume;
    }

    public get totalWeight(): number {
        return this.cargoWeight + this.stats.weight;
    }

    static override datagramDefinition(): void {
        super.datagramDefinition();
        this.datagram = this.datagram.cloneAppend<SerialisedSubmarineBehaviour>({
            ballastWater: datatype.float32,
            control: datatype.vector32,
            hitbox: datatype.uint8,
            leakWater: datatype.float32,
            physics: datatype.uint8,
            leaking: datatype.float32
        });
    }

    constructor(parent: BaseObject, id: number) {
        super(parent, id);
        ObjectScope.game.subscribe("update", this);
        ObjectScope.game.subscribe("post-collision", this);
    }

    override onRemove(): void {
        ObjectScope.game.unsubscribe("update", this);
        ObjectScope.game.unsubscribe("post-collision", this);
    }

    ["update"](dt: number) {
        const s = dt / 60;
        this.updateStats();
        this.drag();
        this.physics.velocity.y += this.buoyancy * gravity * s;
        this.updateControl();

        this.leakWater += this.leaking * s;
        if (this.leakWater > this.stats.volume) this.leakWater = this.stats.volume;

        if (this.leakWater > 0) {
            this.leakWater -= this.stats.leakPumpRate * s;
        } else {
            this.leakWater = 0;
        }

        const normalisedControl = (this.control.y + 1) / 2;
        this.physics.velocity.x += this.stats.engine * this.control.x * s / this.totalWeight;

        this.ballastWater += Math.sign(normalisedControl - this.ballastFill) * this.stats.ballastPumpRate * s;

        if (this.ballastFill > 1) {
            this.ballastWater = this.stats.ballastVolume;
        }

        this.invalidateCache();
    }

    ["post-collision"](dt: number) {
        for (const overlap of this.hitbox.overlaps) {
            let useOffset = new Vector();
            const speed = this.physics.velocity.length();
            if (speed > 0.5) {
                console.log(speed);
                this.leaking += speed - 0.2;
            }
            if (Math.abs(overlap.offset.x) > Math.abs(overlap.offset.y)) {
                useOffset.y = overlap.offset.y;
                this.physics.velocity.y = 0;
            } else {
                useOffset.x = overlap.offset.x;
                this.physics.velocity.x = 0;
            }
            this.parent.position.add(useOffset);
            this.parent.transform.invalidateCache();
        }

        this.invalidateCache();
    }

    updateStats() {
        const airVolume = (this.stats.volume - this.leakWater) + (this.stats.ballastVolume - this.ballastWater);
        this.buoyancy = 1 - (airVolume / this.totalWeight);
    }

    drag() {
        this.physics.velocity.x -= this.physics.velocity.x * this.stats.horizontalDrag;
        this.physics.velocity.y -= this.physics.velocity.y * this.stats.verticalDrag;
    }

    updateControl() {
        if (this.control.x == 0)
            this.control.x = clamp(-1, 1, -this.physics.velocity.x * 5);
        if (this.control.y == 0)
            this.control.y = Math.sign(-this.physics.velocity.y);
    }

    override fromSerialisable(data: SerialisedSubmarineBehaviourComponent): void {
        super.fromSerialisable(data);
        this.ballastWater = data.ballastWater;
        this.leakWater = data.leakWater;
        this.leaking = data.leaking;
        this.physics = this.parent.getComponent(data.physics);
        this.hitbox = this.parent.getComponent(data.hitbox);
        this.control = Vector.fromLike(data.control);
    }

    override toSerialisable(): SerialisedSubmarineBehaviourComponent {
        const data = super.toSerialisable() as SerialisedSubmarineBehaviourComponent;
        data.physics = this.physics.id;
        data.hitbox = this.hitbox.id;
        data.ballastWater = this.ballastWater;
        data.leakWater = this.leakWater;
        data.leaking = this.leaking;
        data.control = this.control.toLike();
        return data;
    }
}

