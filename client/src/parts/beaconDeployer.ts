import { partActions } from "@shared/common";
import { Message, messageType } from "@shared/messages";
import { drawableExtra } from "@shared/mock/drawable";
import { ObjectScope } from "@shared/objectScope";
import { BeaconDeployerPart as MockBeaconDeployerPart } from "@shared/parts/beaconDeployer";
import { Transform } from "@shared/transform";
import { Drawable } from "src/drawable";
import { Network } from "src/network";

export class BeaconDeployerPart extends MockBeaconDeployerPart {
    override ["deploy-beacon"](): void {
        const beacon = ObjectScope.game.createObject();
        const drawable = beacon.addComponent(Drawable);
        const transfrom = beacon.addComponent(Transform);
        drawable.url = "/assets/beacon.png";
        drawable.extra = drawableExtra.background;
        drawable.init();
        transfrom.init();

        beacon.position.set(this.parent.position.x, this.parent.position.y);

        Network.message({
            typeId: messageType.partActivityLinked,
            linkId: beacon.getId(ObjectScope.game),
            objectId: this.parent.getId(ObjectScope.network),
            action: partActions.deployBeacon,
        });
    }
}
