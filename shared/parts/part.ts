import { BaseObject } from "../baseObject";
import { SubmarinePart } from "../common";
import { SerialisedComponent, commonDatatype } from "../component";
import { datatype } from "../datagram";
import { NetComponent } from "../netComponent";
import { ObjectScope } from "../objectScope";
import { SubmarineBehaviour } from "../submarine";

export type SerialisedPart = {
    submarinePart: number;
    submarine: number;
    submarineBehaviourId: number;
    count: number;
}

export type SerialisedPartComponent = SerialisedPart & SerialisedComponent;

export class Part extends NetComponent {
    part!: SubmarinePart;
    count!: number;
    submarine!: SubmarineBehaviour;
    static override datagramDefinition(): void {
        super.datagramDefinition();
        this.datagram = this.datagram.cloneAppend<SerialisedPart>({
            submarine: commonDatatype.objectId,
            submarineBehaviourId: commonDatatype.compId,
            submarinePart: datatype.uint8,
            count: datatype.uint8
        });
    }

    override toSerialisable(): SerialisedPartComponent {
        const data = super.toSerialisable() as SerialisedPartComponent;
        data.submarine = this.submarine.parent.getId(ObjectScope.network);
        data.submarineBehaviourId = this.submarine.id;
        data.submarinePart = this.part.type;
        return data;
    }

    override fromSerialisable(data: SerialisedPartComponent) {
        this.submarine = ObjectScope.network.getObject(data.submarine).getComponent(data.submarineBehaviourId);
        this.part = SubmarinePart.get(data.submarinePart);
        this.count = data.count;
        super.fromSerialisable(data)
    }
}

