import { BaseObject } from "@shared/baseObject";
import { SerialisedComponent } from "@shared/component";
import { Detectable } from "./detectable";
import { ObjectScope } from "@shared/objectScope";
import { Area, Layer, RectInAreas } from "@shared/physics/chunks";
import { physicsLayerEnum, physicsLayers } from "../main";
import { Vector } from "@shared/types";

export type SerialisedRangeDetectable = {
}

export type SerialisedRangeDetectableComponent = SerialisedRangeDetectable & SerialisedComponent;

export class RangeDetectable extends Detectable implements RectInAreas {
    position = new Vector();

    public get x1(): number {
        return this.position.x
    }

    public get x2(): number {
        return this.position.x
    }

    public get y1(): number {
        return this.position.y
    }

    public get y2(): number {
        return this.position.y
    }

    inAreas = new Set<Area>();
    private static lookup = new Map<BaseObject, RangeDetectable>();

    static getByParent(baseobject: BaseObject) {
        return this.lookup.get(baseobject);
    }

    override init(): void {
        super.init();
        RangeDetectable.lookup.set(this.parent, this);
        ObjectScope.game.subscribe("post-collision", this);
        this.position = this.parent.position.result();
        physicsLayers[physicsLayerEnum.detectable].addObject(this);

    }

    ["post-collision"](dt: number) {
        physicsLayers[physicsLayerEnum.detectable].moveObject(this, this.parent.position);
    }

    override onRemove(): void {
        RangeDetectable.lookup.delete(this.parent);
        ObjectScope.game.unsubscribe("post-collision", this);

    }
}

