import { Area, RectWithParent } from "@shared/physics/chunks";
import { FishFood as BaseFishFood } from "./fishFood";

export class FishFood extends BaseFishFood implements RectWithParent {
    override["update"](dt: number): void {
        if(this.food <= 0){
            this.parent.remove();
        }
        super.update(dt);
    }
}
