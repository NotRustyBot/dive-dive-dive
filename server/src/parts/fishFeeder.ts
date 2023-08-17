import { drawableExtra } from "@shared/mock/drawable";
import { ObjectScope } from "@shared/objectScope";
import { FishFeederPart as MockFishFeederPart } from "@shared/parts/fishFeeder";
import { Drawable, FishBait, Sync, Transform } from "../registry";
import { RangeDetectable } from "../server/rangeDetectable";
import { Client } from "src/client";
import { messageType } from "@shared/messages";
import { Vectorlike } from "@shared/types";

export class FishFeederPart extends MockFishFeederPart {
    override ["deploy-bait"](data: { gameId: number; client: Client; position: Vectorlike }): void {
        if (this.parent.position.distanceSquared(data.position) < 500 ** 2) {
            const bait = ObjectScope.game.createObject();
            const transform = bait.addComponent(Transform);
            const drawable = bait.addComponent(Drawable);
            const sync = bait.addComponent(Sync);
            const detectable = bait.addComponent(RangeDetectable);
            const fishBait = bait.addComponent(FishBait);
            drawable.url = "/assets/bait.png";
            drawable.extra = drawableExtra.entity;
            transform.position.set(data.position.x, data.position.y);
            fishBait.food = 100;
            fishBait.max = 100;
            fishBait.generation = -0.1;
            sync.authorize([transform, drawable, fishBait]);
            bait.initialiseComponents();
            ObjectScope.network.scopeObject(bait);
            data.client.message({ typeId: messageType.objectLink, netId: bait.getId(ObjectScope.network), linkId: data.gameId });
            
        } else {
            data.client.message({ typeId: messageType.actionFailedLinked, linkId: data.gameId, text: "Action Failed" });
        }
    }
}
