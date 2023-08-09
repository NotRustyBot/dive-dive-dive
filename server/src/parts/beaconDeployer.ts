import { drawableExtra } from "@shared/mock/drawable";
import { ObjectScope } from "@shared/objectScope";
import { BeaconDeployerPart as MockBeaconDeployerPart } from "@shared/parts/beaconDeployer";
import { Drawable, Light, Sync, Transform } from "../registry";
import { RangeDetectable } from "../server/rangeDetectable";
import { connector } from "src/main";
import { Client } from "src/client";
import { messageType } from "@shared/messages";

export class BeaconDeployerPart extends MockBeaconDeployerPart {
    override ["deploy-beacon"](data: { gameId: number; client: Client }): void {
        const beacon = ObjectScope.game.createObject();
        const transform = beacon.addComponent(Transform);
        const drawable = beacon.addComponent(Drawable);
        const sync = beacon.addComponent(Sync);
        const glow = beacon.addComponent(Light);
        const detectable = beacon.addComponent(RangeDetectable);
        drawable.url = "/assets/beacon.png";
        drawable.extra = drawableExtra.background;
        transform.position.set(this.parent.position.x, this.parent.position.y);
        transform.init();
        glow.offset.y = -45;
        glow.range = 100;
        glow.intensity = 3;
        glow.extra = 1;
        glow.tint = 0xff8888;
        sync.authorize([transform, drawable]);
        drawable.init();
        sync.init();
        glow.init();
        detectable.init();
        ObjectScope.network.scopeObject(beacon);
        data.client.message({ typeId: messageType.objectLink, netId: beacon.getId(ObjectScope.network), linkId: data.gameId });
    }
}
