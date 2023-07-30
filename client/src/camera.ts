import { Vector, Vectorlike } from "@shared/types";

export class Camera {
    static position = new Vector();
    static scale = 1;
    static size = new Vector();



    static toScreen(v: Vectorlike) {
        return this.position.result().sub(v);
    }

    
}