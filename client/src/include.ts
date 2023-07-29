import { SubControl } from "./submarineControl"
import { Drawable } from "./drawable"
import { DynamicHitbox } from "../../shared/dynamicHitbox"
import { Hitbox } from "../../shared/hitbox"
import { Physics } from "../../shared/physics"
import { PhysicsDrawable } from "./physicsDrawable"
import { SubmarineBehaviour } from "../../shared/submarine"
import { Transform } from "../../shared/transform"
import { Sync } from "@shared/sync"
import { ServerInfo } from "@shared/serverInfo"


export function initModules(){
    SubControl.initialise();
    ServerInfo.initialise();
    Drawable.initialise();
    DynamicHitbox.initialise();
    Hitbox.initialise();
    Physics.initialise();
    PhysicsDrawable.initialise();
    SubmarineBehaviour.initialise();
    Transform.initialise();
    Sync.initialise();
    
}