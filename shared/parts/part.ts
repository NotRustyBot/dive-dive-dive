import { SubmarinePart } from "../common";
import { SerialisedComponent, commonDatatype } from "../component";
import { datatype } from "../datagram";
import { NetComponent } from "../netComponent";
import { SubmarineBehaviour } from "../submarine";

export type SerialisedPart = {
    submarinePart: number;
    submarineBehaviour: number;
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
            submarineBehaviour: commonDatatype.compId,
            submarinePart: datatype.uint8,
            count: datatype.uint8
        });
    }

    override toSerialisable(): SerialisedPartComponent {
        const data = super.toSerialisable() as SerialisedPartComponent;
        data.submarineBehaviour = this.submarine.id;
        data.submarinePart = this.part.type;
        return data;
    }

    override init(): void {

    }

    override fromSerialisable(data: SerialisedPartComponent) {
        super.fromSerialisable(data);
        this.part = SubmarinePart.get(data.submarinePart);
        this.submarine = this.parent.getComponent(data.submarineBehaviour);
        this.count = data.count;
    }
}

