import { drawableExtra } from "@shared/mock/drawable";
import { ObjectScope } from "@shared/objectScope";
import { BeaconDeployerPart as MockBeaconDeployerPart } from "@shared/parts/beaconDeployer";
import { Drawable, Light, Sync, Transform } from "../registry";
import { RangeDetectable } from "../server/rangeDetectable";

export class BeaconDeployerPart extends MockBeaconDeployerPart {
    override ["deploy-beacon"](): void {
        const image = ObjectScope.game.createObject();
        const transform = image.addComponent(Transform);
        const drawable = image.addComponent(Drawable);
        const sync = image.addComponent(Sync);
        const glow = image.addComponent(Light);
        const detectable = image.addComponent(RangeDetectable);
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
        ObjectScope.network.scopeObject(image);
    }
}
