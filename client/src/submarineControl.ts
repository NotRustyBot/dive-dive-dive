import { SubControl as MockSubControl, SerialisedSubControlComponent } from "@shared/mock/submarineControl";
import { Vectorlike } from "@shared/types";
import { keys } from "./control";
import { Network } from "./network";
import { NetManager } from "@shared/netManager";
import { Camera } from "./camera";

export type SerialisedSubControl = {
    vector: Vectorlike,
    submarine: number
}



export class SubControl extends MockSubControl {
    static current: SubControl;
    override ["input"](params: any) {
        this.vector.set(0, 0);
        
        if(Camera.detached) return;
        if(NetManager.identity != this.submarine.owner) return;
        SubControl.current = this;

        if (keys["d"]) this.vector.x = 1;
        if (keys["a"]) this.vector.x = -1;
        if (keys["w"]) this.vector.y = -1;
        if (keys["s"]) this.vector.y = 1;
        this.submarine.control.set(this.vector.x, this.vector.y);
        this.invalidateCache();
    }
}
