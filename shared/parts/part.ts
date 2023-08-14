import { SubmarinePart, partTypes } from "../common";
import { SerialisedComponent, commonDatatype } from "../component";
import { datatype } from "../datagram";
import { NetComponent } from "../netComponent";
import { SubmarineBehaviour } from "../submarine";
import { Assemblies } from "../submarineAssemblies";

export type SerialisedPart = {
    submarinePart: number;
    count: number;
    assemblies: number
}

export type SerialisedPartComponent = SerialisedPart & SerialisedComponent;

export class Part extends NetComponent {
    static partLookup = new Map<partTypes, typeof Part>;

    part!: SubmarinePart;
    count!: number;
    assemblies: Assemblies;
    
    public get submarine() : SubmarineBehaviour {
        return this.assemblies.submarine
    }
    

    static partType: partTypes;
    static override initialise(): void {
        super.initialise();
        this.partLookup.set(this.partType, this);
    }

    static override datagramDefinition(): void {
        super.datagramDefinition();
        this.datagram = this.datagram.cloneAppend<SerialisedPart>({
            submarinePart: datatype.uint8,
            count: datatype.uint8,
            assemblies: commonDatatype.compId
        });
    }

    override toSerialisable(): SerialisedPartComponent {
        const data = super.toSerialisable() as SerialisedPartComponent;
        data.submarinePart = this.part.type;
        data.assemblies = this.assemblies.id
        return data;
    }

    override fromSerialisable(data: SerialisedPartComponent) {
        super.fromSerialisable(data);
        this.part = SubmarinePart.get(data.submarinePart);
        this.assemblies = this.parent.getComponent(data.assemblies);
        this.count = data.count;
    }
}

