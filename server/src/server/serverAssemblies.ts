import { Assemblies as MockAssemblies } from "@shared/submarineAssemblies";
import { RangeDetector } from "./rangeDetector";
import { Part } from "@shared/parts/part";

export class Assemblies extends MockAssemblies {
    rangeDetector!: RangeDetector;
    override calculateStats() {
        super.calculateStats();
        const maxRange = Math.max(this.submarine.stats.lightEffectiveRange(), this.submarine.stats.sonarEffectiveRange());
        this.rangeDetector.range = {x: maxRange, y: maxRange};
    }

    attachParts() {
        for (const assembly of this.assemblies) {
            if (Part.partLookup.has(assembly.part.type)) {
                const part = this.parent.addComponent(Part.partLookup.get(assembly.part.type)) as Part;
                part.count = assembly.count;
                part.assemblies = this;
            }
        }
    }

}

