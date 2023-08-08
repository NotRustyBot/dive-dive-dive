
export { NetManager } from "@shared/netManager"
export { ObjectScope } from "@shared/objectScope"
export { Message } from "@shared/messages"

import { SubmarineBehaviour } from "@shared/submarine"
import { PhysicsDrawable } from "@shared/mock/physicsDrawable";
import { DynamicHitbox } from "@shared/dynamicHitbox";
import { SubControl } from "@shared/mock/submarineControl";
import { ServerInfo } from "@shared/serverInfo";
import { Transform } from "@shared/transform";
import { Drawable } from "@shared/mock/drawable";
import { Light } from "@shared/mock/light";
import { Physics } from "@shared/physics";
import { Hitbox } from "@shared/hitbox";
import { Sync } from "@shared/sync"
import { FishBehaviour } from "@shared/fish"
import { RangeDetectable } from "./server/rangeDetectable";
import { RangeDetector } from "./server/rangeDetector";


Sync.initialise();
Light.initialise();
Hitbox.initialise();
Physics.initialise();
Drawable.initialise();
Transform.initialise();
SubControl.initialise();
ServerInfo.initialise();
DynamicHitbox.initialise();
PhysicsDrawable.initialise();
SubmarineBehaviour.initialise();
FishBehaviour.initialise();

RangeDetectable.initialise();
RangeDetector.initialise();


export { PhysicsDrawable } from "@shared/mock/physicsDrawable";
export { SubControl } from "@shared/mock/submarineControl";
export { SubmarineBehaviour } from "@shared/submarine";
export { DynamicHitbox } from "@shared/dynamicHitbox";
export { Drawable } from "@shared/mock/drawable";
export { ServerInfo } from "@shared/serverInfo";
export { Transform } from "@shared/transform";
export { Physics } from "@shared/physics";
export { Hitbox } from "@shared/hitbox";
export { Sync } from "@shared/sync";
export { FishBehaviour } from "@shared/fish"
export { Light } from "@shared/mock/light";







