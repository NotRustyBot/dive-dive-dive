import { BaseObject } from "../baseObject";
import { SubmarinePart, partTypes } from "../common";
import { commonDatatype } from "../component";
import { datatype } from "../datagram";
import { SubStats } from "../stats";
import { Assemblies } from "../submarineAssemblies";
import { Part, SerialisedPartComponent } from "./part";

export type SerialisedActiveSonarPart = {
    enabled: number;
};

export type SerialisedActiveSonarPartComponent = SerialisedActiveSonarPart & SerialisedPartComponent;

export class ActiveSonarPart extends Part {
    static override partType = partTypes.sonar;
    enabled = 0;
    buff = new SubStats({ sonarPower: 16_000_000, passiveDraw: 0.01 });
    
    
    static override datagramDefinition(): void {
        super.datagramDefinition();
        this.datagram = this.datagram.cloneAppend<SerialisedActiveSonarPart>({
            enabled: datatype.uint8,
        });
        this.cacheSize = 0;
    }

    constructor(parent: BaseObject, id: number) {
        super(parent, id);
        this.part = SubmarinePart.get(partTypes.sonar);
    }

    override onRemove(): void {
        super.onRemove();
        this.submarine.commands.unsubscribe("toggle-sonar", this);
    }

    override init(): void {
        super.init();
        this.submarine.commands.subscribe("toggle-sonar", this);
    }

    ["toggle-sonar"](...params: any) {

    }

    applyStats() {
        if (this.enabled) {
            this.assemblies.buffs.add(this.buff);
        } else {
            this.assemblies.buffs.delete(this.buff);
        }
        this.assemblies.calculateStats();
    }

    override toSerialisable(): SerialisedActiveSonarPartComponent {
        const data = super.toSerialisable() as SerialisedActiveSonarPartComponent;
        data.enabled = this.enabled;
        return data;
    }

    override fromSerialisable(data: SerialisedActiveSonarPartComponent) {
        super.fromSerialisable(data);
        this.enabled = data.enabled;
        this.applyStats();
    }
}
