import { partActions } from "@shared/common";
import { Message, messageType } from "@shared/messages";
import { ObjectScope } from "@shared/objectScope";
import { BeaconDeployerPart as MockBeaconDeployerPart } from "@shared/parts/beaconDeployer";
import { Network } from "src/network";

export class BeaconDeployerPart extends MockBeaconDeployerPart {
    override ["deploy-beacon"](): void {
        Network.message({
            typeId: messageType.partActivity,
            objectId: this.parent.getId(ObjectScope.network),
            action: partActions.deployBeacon
        });
    }
}
