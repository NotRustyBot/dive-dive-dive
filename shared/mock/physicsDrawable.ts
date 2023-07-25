import { datatype } from "../datagram";
import { BaseObject } from "../baseObject";
import { Component, Serialisable, SerialisedComponent, compDatatype } from "../component";
import { Physics } from "../physics";


export type SerialisedPhysicsDrawable = {
    physics: number;
    url: string;
}

export type SerialisedPhysicsDrawableComponent = SerialisedPhysicsDrawable & SerialisedComponent;

export class PhysicsDrawable extends Component {
    physics!: Physics;
    url!: string;

    static override datagramDefinition(): void {
        this.datagram = super.datagram.cloneAppend<SerialisedPhysicsDrawable>({
            physics: compDatatype.compId,
            url: datatype.string
        });
        this.cacheSize = 2 * 64;
    }

    override toSerialisable(): SerialisedPhysicsDrawableComponent {
        const data = super.toSerialisable() as SerialisedPhysicsDrawableComponent;
        data.physics = this.physics.id;
        data.url = this.url;
        return data;
    }

    override fromSerialisable(data: SerialisedPhysicsDrawableComponent) {
        super.fromSerialisable(data);
        this.physics = this.parent.getComponent(data.physics);
        this.url = data.url;
    }
}

