import { BaseObject } from "../baseObject";
import { SubmarinePart, partTypes } from "../common";
import { Part, SerialisedPartComponent } from "./part";

export type SerialisedFishFeederPart = {};

export type SerialisedFishFeederPartComponent = SerialisedFishFeederPart & SerialisedPartComponent;

export class FishFeederPart extends Part {
    static override partType = partTypes.fishFeeder;

    static override datagramDefinition(): void {
        super.datagramDefinition();
        this.datagram = this.datagram.cloneAppend<SerialisedFishFeederPart>({});
        this.cacheSize = 0;
    }

    constructor(parent: BaseObject, id: number) {
        super(parent, id);
        this.part = SubmarinePart.get(partTypes.fishFeeder);
    }

    override onRemove(): void {
        super.onRemove();
        this.submarine.commands.unsubscribe("deploy-bait", this);
    }

    override init(): void {
        super.init();
        this.submarine.commands.subscribe("deploy-bait", this);
    }

    ["deploy-bait"](...params: any) {

    }


    override toSerialisable(): SerialisedFishFeederPartComponent {
        const data = super.toSerialisable() as SerialisedFishFeederPartComponent;
        return data;
    }

    override fromSerialisable(data: SerialisedFishFeederPartComponent) {
        super.fromSerialisable(data);
    }
}
