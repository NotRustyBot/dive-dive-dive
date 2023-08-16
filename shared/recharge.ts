import { BaseObject } from "./baseObject";
import { SerialisedComponent, commonDatatype } from "./component";
import { Hitbox } from "./hitbox";
import { NetComponent } from "./netComponent";
import { ObjectScope } from "./objectScope";
import { SubmarineBehaviour } from "./submarine";

export type SerialisedRecharge = {
    hitbox: number;
};

export type SerialisedRechargeComponent = SerialisedRecharge & SerialisedComponent;

export class Recharge extends NetComponent {
    hitbox: Hitbox;
    static override datagramDefinition(): void {
        super.datagramDefinition();
        this.datagram = this.datagram.cloneAppend<SerialisedRecharge>({
            hitbox: commonDatatype.compId,
        });
        this.cacheSize = 0;
    }

    constructor(parent: BaseObject, id: number) {
        super(parent, id);
        ObjectScope.game.subscribe("post-collision", this);
    }

    ["post-collision"]() {
        this.hitbox.checkCollisions();
        for (const [_, overlaps] of this.hitbox.overlaps) {
            for (const overlap of overlaps) {
                const sub = overlap.with.parent.getComponentByType(SubmarineBehaviour);
                if (sub) {
                    sub.battery++;
                }
            }
        }
    }

    override onRemove(): void {
        ObjectScope.game.unsubscribe("post-collision", this);
    }

    override toSerialisable(): SerialisedRechargeComponent {
        const data = super.toSerialisable() as SerialisedRechargeComponent;
        data.hitbox = this.hitbox.id;
        return data;
    }

    override fromSerialisable(data: SerialisedRechargeComponent) {
        this.hitbox = this.parent.getComponent(data.hitbox);
        super.fromSerialisable(data);
    }
}
