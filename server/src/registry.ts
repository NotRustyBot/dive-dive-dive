
export { NetManager } from "@shared/netManager"
export { ObjectScope } from "@shared/objectScope"
export { Message } from "@shared/messages"

import { PhysicsDrawable } from "@shared/mock/physicsDrawable";
import { MarkerDetectable } from "./server/markerDetectable";
import { BeaconDeployerPart } from "./parts/beaconDeployer";
import { SubControl } from "@shared/mock/submarineControl";
import { RangeDetectable } from "./server/rangeDetectable";
import { MarkerDetector } from "./server/markerDetector";
import { Assemblies } from "@shared/submarineAssemblies";
import { SubmarineBehaviour } from "@shared/submarine";
import { RangeDetector } from "./server/rangeDetector";
import { DynamicHitbox } from "@shared/dynamicHitbox";
import { Drawable } from "@shared/mock/drawable";
import { ServerInfo } from "@shared/serverInfo";
import { Transform } from "@shared/transform";
import { FishBehaviour } from "@shared/fish";
import { Marker } from "@shared/mock/marker";
import { Light } from "@shared/mock/light";
import { Physics } from "@shared/physics";
import { Hitbox } from "@shared/hitbox";
import { Sync } from "@shared/sync";


Sync.initialise();
Light.initialise();
Hitbox.initialise();
Marker.initialise();
Physics.initialise();
Drawable.initialise();
Transform.initialise();
SubControl.initialise();
Assemblies.initialise();
ServerInfo.initialise();
FishBehaviour.initialise();
DynamicHitbox.initialise();
RangeDetector.initialise();
MarkerDetector.initialise();
RangeDetectable.initialise();
PhysicsDrawable.initialise();
MarkerDetectable.initialise();
SubmarineBehaviour.initialise();
BeaconDeployerPart.initialise();



export { PhysicsDrawable } from "@shared/mock/physicsDrawable";
export { MarkerDetectable } from "./server/markerDetectable";
export { BeaconDeployerPart } from "./parts/beaconDeployer";
export { SubControl } from "@shared/mock/submarineControl";
export { Assemblies } from "@shared/submarineAssemblies";
export { MarkerDetector } from "./server/markerDetector";
export { SubmarineBehaviour } from "@shared/submarine";
export { DynamicHitbox } from "@shared/dynamicHitbox";
export { Drawable } from "@shared/mock/drawable";
export { ServerInfo } from "@shared/serverInfo";
export { Transform } from "@shared/transform";
export { FishBehaviour } from "@shared/fish";
export { Light } from "@shared/mock/light";
export { Physics } from "@shared/physics";
export { Hitbox } from "@shared/hitbox";
export { Sync } from "@shared/sync";







