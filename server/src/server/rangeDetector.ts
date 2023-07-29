import { BaseObject } from "@shared/baseObject";
import { SerialisedComponent } from "@shared/component";
import { Detector } from "./detector";
import { physicsLayerEnum, physicsLayers } from "../main";
import { RangeDetectable } from "./rangeDetectable";


export type SerialisedRangeDetector = {
}

export type SerialisedRangeDetectorComponent = SerialisedRangeDetector & SerialisedComponent;

export class RangeDetector extends Detector {


    constructor(parent: BaseObject, id: number) {
        super(parent, id);
    }

    override detect() {
        const areas = physicsLayers[physicsLayerEnum.detectable].getNearbyObjects(this.parent.position, 2000);

        for (const area of areas) {
            for (const rect of area) {
                const detectable = RangeDetectable.getByParent(rect.parent)
                if(detectable) this.detected(detectable);
            }
        }

    }
}