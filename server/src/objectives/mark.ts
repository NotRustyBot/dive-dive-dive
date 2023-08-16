import { Vector } from "@shared/types";
import { MissionTask } from "./missionTask";
import { Hitbox } from "@shared/hitbox";
import { BaseObject } from "@shared/baseObject";
import { ObjectScope } from "@shared/objectScope";
import { beaconLayer, submarineLayer } from "@shared/common";
import { Transform } from "@shared/transform";
import { taskId } from "@shared/objectives";
import { Mission } from "./mission";

export class MarkTask extends MissionTask {
    static override taskId = taskId.beacon;
    hitbox: Hitbox;
    handler: BaseObject;

    override start(mission: Mission): void {
        super.start(mission);
        this.handler = ObjectScope.game.createObject();
        this.handler.addComponent(Transform);
        this.hitbox = this.handler.addComponent(Hitbox);
        this.hitbox.sides = new Vector(300, 300);
        this.hitbox.peek = [beaconLayer];
        this.handler.position.set(this.position.x, this.position.y);
        this.handler.initialiseComponents();
        ObjectScope.game.subscribe("post-collision", this);
    }

    finish(): void {
        ObjectScope.game.unsubscribe("post-collision", this);
        this.handler.remove();
        this.done = true;
        this.mission.statusUpdate();
    }

    ["post-collision"]() {
        this.hitbox.checkCollisions();
        for (const [_, overlap] of this.hitbox.overlaps) {
            for (const o of overlap) {
                this.finish();
                break;
            }
        }
    }
}
