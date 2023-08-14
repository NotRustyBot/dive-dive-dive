import { SubmarineAssembly, SubmarinePart } from "./common";
import { Component, SerialisedComponent, commonDatatype } from "./component";
import { datatype, Datagram } from "./datagram";
import { NetComponent } from "./netComponent";
import { Part } from "./parts/part";
import { SubStats } from "./stats";
import { SubmarineBehaviour } from "./submarine";

export type SerialisedAssemblies = {
    assemblies: Array<{ part: number; count: number }>;
    submarine: number;
};

export type SerialisedAssembliesComponent = SerialisedAssemblies & SerialisedComponent;

export class Assemblies extends NetComponent {
    assemblies = new Array<SubmarineAssembly>();
    submarine!: SubmarineBehaviour;
    buffs = new Set<SubStats>();

    static override datagramDefinition(): void {
        super.datagramDefinition();
        const assemblyDatagram = new Datagram().append<SubmarineAssembly>({ count: datatype.uint8, part: datatype.uint8 });
        this.datagram = this.datagram.cloneAppend<SerialisedAssemblies>({
            assemblies: [datatype.array, assemblyDatagram],
            submarine: commonDatatype.compId,
        });
        this.cacheSize = assemblyDatagram.calculateMinimalSize() * 64;
    }

    override init(): void {
        super.init();
        this.calculateStats();
    }

    calculateStats() {
        this.submarine.stats = new SubStats({});
        for (const assembly of this.assemblies) {
            this.submarine.stats.addAssembly(assembly);
        }

        for (const buff of this.buffs) {
            this.submarine.stats.addProperties(buff);
        }

        this.invalidateCache();
    }

    override toSerialisable(): SerialisedAssembliesComponent {
        const data = super.toSerialisable() as SerialisedAssembliesComponent;
        data.submarine = this.submarine.id;
        data.assemblies = this.assemblies.map((a) => ({ count: a.count, part: a.part.type }));
        return data;
    }

    override fromSerialisable(data: SerialisedAssembliesComponent) {
        super.fromSerialisable(data);
        this.submarine = this.parent.getComponent(data.submarine);
        this.assemblies = data.assemblies.map((a) => ({ count: a.count, part: SubmarinePart.get(a.part) }));
        this.calculateStats();
    }
}
