import { SubControl } from "./submarineControl"
import { Drawable } from "./drawable"
import { DynamicHitbox } from "../../shared/dynamicHitbox"
import { Hitbox } from "../../shared/hitbox"
import { Physics } from "../../shared/physics"
import { PhysicsDrawable } from "./physicsDrawable"
import { SubmarineBehaviour } from "../../shared/submarine"
import { Transform } from "../../shared/transform"
import { Sync } from "@shared/sync"
import { Light } from "./light"
import { ServerInfo } from "@shared/serverInfo"
import { FishBehaviour } from "@shared/fish"
import { Assemblies } from "@shared/submarineAssemblies"
import { BeaconDeployerPart } from "./parts/beaconDeployer"
import { ActiveSonarPart } from "./parts/activeSonar"
import { Marker } from "marker"


export function initModules(){
    SubControl.initialise();
    ServerInfo.initialise();
    Marker.initialise();
    Drawable.initialise();
    DynamicHitbox.initialise();
    Hitbox.initialise();
    Physics.initialise();
    PhysicsDrawable.initialise();
    SubmarineBehaviour.initialise();
    Transform.initialise();
    Sync.initialise();
    Light.initialise();
    FishBehaviour.initialise();
    Assemblies.initialise();
    BeaconDeployerPart.initialise();
    ActiveSonarPart.initialise();
}