import { Vector, Vectorlike } from "./types";
import { gravity } from "./constants";
import { SubStats, SubStatsData } from "./stats";
import { BaseObject } from "./baseObject";
import { Physics } from "./physics";
import { Hitbox } from "./hitbox";
import { clamp } from "./utils";
import { Datagram, datatype } from "./datagram";
import { ObjectScope } from "./objectScope";
import { SubmarineAssembly, SubmarinePart } from "./common";
import { SerialisedComponent } from "./component";
import { NetComponent } from "./netComponent";
import { IncidentRotuer } from "./incident";

export type SerialisedSubmarineBehaviour = {
    physics: number;
    hitbox: number;
    ballastWater: number;
    leakWater: number;
    leaking: number;
    owner: number;
    battery: number;
    control: Vectorlike;
};

export type SerialisedSubmarineBehaviourComponent = SerialisedSubmarineBehaviour & SerialisedComponent;

export class SubmarineBehaviour extends NetComponent {
    control = new Vector();
    physics!: Physics;
    hitbox!: Hitbox;
    buoyancy = 0;
    cargoWeight = 0;
    stats: SubStats;
    ballastWater = 0;
    leakWater = 0;
    leaking = 0;
    battery = Infinity;
    owner = 0;

    targetFill = 0;
    commands = new IncidentRotuer();

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
            leaking: datatype.float32,
            owner: datatype.uint32,
            battery: datatype.float32,
        });
        this.cacheSize;
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

        const normalisedControl = (this.targetFill + 1) / 2;
        this.physics.velocity.x += (this.stats.engine * this.control.x * s) / this.totalWeight;

        this.ballastWater += Math.sign(normalisedControl - this.ballastFill) * this.stats.ballastPumpRate * s;

        const pumping = Math.abs(normalisedControl - this.ballastFill);

        this.battery -= (pumping * this.stats.ballastPumpCost + this.stats.engineCost * Math.abs(this.control.x)) * s;

        if (this.ballastFill > 1) {
            this.ballastWater = this.stats.ballastVolume;
        }

        this.battery = clamp(0, this.stats.battery, this.battery);

        this.invalidateCache();
    }

    ["post-collision"](dt: number) {
        for (const [layer, overlaps] of this.hitbox.overlaps) {
            for (const overlap of overlaps) {
                let useOffset = new Vector();
                const speed = this.physics.velocity.length();
                if (speed > 0.5) {
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
        }
        this.invalidateCache();
    }

    updateStats() {
        const airVolume = this.stats.volume - this.leakWater + (this.stats.ballastVolume - this.ballastWater);
        this.buoyancy = 1 - airVolume / this.totalWeight;
    }

    drag() {
        this.physics.velocity.x -= this.physics.velocity.x * this.stats.horizontalDrag;
        this.physics.velocity.y -= this.physics.velocity.y * this.stats.verticalDrag;
    }

    updateControl() {
        if (this.control.x == 0) this.control.x = clamp(-1, 1, -this.physics.velocity.x * 5);
        if (this.control.y == 0) {
            this.targetFill -= this.buoyancy;
            this.targetFill = clamp(-1, 1, this.targetFill);
        } else {
            this.targetFill = this.control.y;
        }
    }

    override fromSerialisable(data: SerialisedSubmarineBehaviourComponent): void {
        super.fromSerialisable(data);
        this.ballastWater = data.ballastWater;
        this.leakWater = data.leakWater;
        this.leaking = data.leaking;
        this.owner = data.owner;
        this.battery = data.battery;
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
        data.owner = this.owner;
        data.battery = this.battery;
        data.control = this.control.toLike();
        return data;
    }
}
