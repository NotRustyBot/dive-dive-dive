import { SubControl as MockSubControl, SerialisedSubControlComponent } from "@shared/mock/sumbarineControl";
import { Vectorlike } from "@shared/types";
import { keys } from "./control";

export type SerialisedSubControl = {
    vector: Vectorlike,
    submarine: number
}

export class SubControl extends MockSubControl {
    ["input"](params: any) {
        this.vector.set(0, 0);
        if (keys["d"]) this.vector.x = 1;
        if (keys["a"]) this.vector.x = -1;
        if (keys["w"]) this.vector.y = -1;
        if (keys["s"]) this.vector.y = 1;
        this.submarine.control.set(this.vector.x, this.vector.y);
        this.invalidateCache();
    }
}
