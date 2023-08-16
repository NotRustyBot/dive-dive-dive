
export { NetManager } from "@shared/netManager"
export { ObjectScope } from "@shared/objectScope"
export { Message } from "@shared/messages"

import { PhysicsDrawable } from "@shared/mock/physicsDrawable";
import { MarkerDetectable } from "./server/markerDetectable";
import { BeaconDeployerPart } from "./parts/beaconDeployer";
import { ActiveSonarPart } from "./parts/activeSonar";
import { SubControl } from "@shared/mock/submarineControl";
import { RangeDetectable } from "./server/rangeDetectable";
import { MarkerDetector } from "./server/markerDetector";
import { Assemblies } from "./server/serverAssemblies";
import { SubmarineBehaviour } from "@shared/submarine";
import { RangeDetector } from "./server/rangeDetector";
import { DynamicHitbox } from "@shared/dynamicHitbox";
import { Drawable } from "@shared/mock/drawable";
import { ClientData } from "@shared/clientData";
import { Reputation } from "@shared/reputation";
import { ServerInfo } from "@shared/serverInfo";
import { Mission } from "./objectives/mission";
import { Transform } from "@shared/transform";
import { FishBehaviour } from "@shared/fish";
import { Marker } from "@shared/mock/marker";
import { Recharge } from "@shared/recharge";
import { Light } from "@shared/mock/light";
import { Physics } from "@shared/physics";
import { Hitbox } from "@shared/hitbox";
import { Sync } from "@shared/sync";

Sync.initialise();
Light.initialise();
Hitbox.initialise();
Marker.initialise();
Mission.initialise();
Physics.initialise();
Drawable.initialise();
Recharge.initialise();
Transform.initialise();
ClientData.initialise();
SubControl.initialise();
Assemblies.initialise();
Reputation.initialise();
ServerInfo.initialise();
FishBehaviour.initialise();
DynamicHitbox.initialise();
RangeDetector.initialise();
MarkerDetector.initialise();
RangeDetectable.initialise();
ActiveSonarPart.initialise();
PhysicsDrawable.initialise();
MarkerDetectable.initialise();
SubmarineBehaviour.initialise();
BeaconDeployerPart.initialise();



export { PhysicsDrawable } from "@shared/mock/physicsDrawable";
export { MarkerDetectable } from "./server/markerDetectable";
export { BeaconDeployerPart } from "./parts/beaconDeployer";
export { ActiveSonarPart } from "./parts/activeSonar";
export { SubControl } from "@shared/mock/submarineControl";
export { Assemblies } from "./server/serverAssemblies";
export { MarkerDetector } from "./server/markerDetector";
export { SubmarineBehaviour } from "@shared/submarine";
export { DynamicHitbox } from "@shared/dynamicHitbox";
export { Drawable } from "@shared/mock/drawable";
export { ServerInfo } from "@shared/serverInfo";
export { Reputation } from "@shared/reputation";
export { Mission } from "./objectives/mission";
export { Transform } from "@shared/transform";
export { ClientData } from "@shared/clientData";
export { FishBehaviour } from "@shared/fish";
export { Recharge } from "@shared/recharge";
export { Light } from "@shared/mock/light";
export { Physics } from "@shared/physics";
export { Hitbox } from "@shared/hitbox";
export { Sync } from "@shared/sync";







