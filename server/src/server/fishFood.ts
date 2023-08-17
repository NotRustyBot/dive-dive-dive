import { BaseObject } from "@shared/baseObject";
import { FishFood as MockFishFood } from "@shared/fishFood";
import { Area, RectWithParent } from "@shared/physics/chunks";
import { Vector } from "@shared/types";
import { physicsLayerEnum, physicsLayers } from "../main";

const foodRange = 2000;

export class FishFood extends MockFishFood implements RectWithParent {
    inAreas = new Set<Area>();
    position = new Vector();
    public get x1(): number {
        return this.parent.position.x - foodRange;
    }
    public get x2(): number {
        return this.parent.position.x + foodRange;
    }
    public get y1(): number {
        return this.parent.position.y - foodRange;
    }
    public get y2(): number {
        return this.parent.position.y + foodRange;
    }

    override init(): void {
        super.init();
        physicsLayers[physicsLayerEnum.fishFood].addObject(this, this.inAreas);
        this.move();
        FishFood.lookup.set(this.parent, this);
    }

    move(){
        physicsLayers[physicsLayerEnum.fishFood].moveObject(this, this.parent.position, this.inAreas);
    }

    override onRemove(): void {
        physicsLayers[physicsLayerEnum.fishFood].removeObject(this, this.inAreas);
        FishFood.lookup.delete(this.parent);
        super.onRemove();
    }

    private static lookup = new Map<BaseObject, FishFood>();
    static getByParent(object: BaseObject){
        return this.lookup.get(object);
    }
}
