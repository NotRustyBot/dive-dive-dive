import { drawableExtra } from "@shared/mock/drawable";
import { ObjectScope } from "@shared/objectScope";
import { BeaconDeployerPart as MockBeaconDeployerPart } from "@shared/parts/beaconDeployer";
import { Drawable, Light, MarkerDetectable, Sync, Transform } from "../registry";
import { RangeDetectable } from "../server/rangeDetectable";
import { Client } from "src/client";
import { messageType } from "@shared/messages";
import { Marker } from "@shared/mock/marker";

export class BeaconDeployerPart extends MockBeaconDeployerPart {
    override ["deploy-beacon"](data: { gameId: number; client: Client }): void {
        const beacon = ObjectScope.game.createObject();
        const transform = beacon.addComponent(Transform);
        const drawable = beacon.addComponent(Drawable);
        const sync = beacon.addComponent(Sync);
        const glow = beacon.addComponent(Light);
        const detectable = beacon.addComponent(RangeDetectable);
        const markerDetectable = beacon.addComponent(MarkerDetectable);
        const marker = beacon.addComponent(Marker);
        drawable.url = "/assets/beacon.png";
        drawable.extra = drawableExtra.background;
        transform.position.set(this.parent.position.x, this.parent.position.y);
        markerDetectable.range = 5000;
        marker.range = 5000;
        marker.tint = 0xff5555;
        glow.offset.y = -45;
        glow.range = 100;
        glow.intensity = 3;
        glow.extra = 1;
        glow.tint = 0xff8888;
        sync.authorize([transform, drawable]);
        transform.init();
        drawable.init();
        sync.init();
        glow.init();
        detectable.init();
        markerDetectable.init();
        marker.init();
        ObjectScope.network.scopeObject(beacon);
        data.client.message({ typeId: messageType.objectLink, netId: beacon.getId(ObjectScope.network), linkId: data.gameId });
    }
}
