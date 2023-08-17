import { FishBehaviour as MockFishBehaviour } from "@shared/fish";
import { physicsLayerEnum, physicsLayers } from "../main";
import { FishFood } from "./fishFood";
import { DynamicHitbox, FishBait, Light, ObjectScope, Physics, PhysicsDrawable, Sync, Transform } from "../registry";
import { Vector } from "@shared/types";
import { submarineLayer, terrainLayer } from "@shared/common";
import { drawableExtra } from "@shared/mock/drawable";
import { RangeDetectable } from "./rangeDetectable";
import { clamp } from "@shared/utils";

export class FishBehaviour extends MockFishBehaviour {
    override ["update"](dt: number): void {
        const area = physicsLayers[physicsLayerEnum.fishFood].getObjects(this.parent.position);
        for (const rect of area) {
            const food = FishFood.getByParent(rect.parent);
            if (food) {
                const diff = food.position.diff(this.parent.position);
                const lsqr = diff.lengthSquared();
                this.control.add(diff.result().normalize(Math.min(0.1, 1 / this.food) * clamp(0.5, 2, food.food / 50) * Math.min(1, 500 ** 2 / lsqr)));
                if (lsqr < 100 ** 2) {
                    const eaten = food.feed(0.01);
                    this.food += eaten;
                }
            }
        }

        if (this.food >= 20) {
            this.food = 5;
            spawnFish(this.parent.position.result());
        }

        super.update(dt);

        if (this.food <= 0) {
            const bait = this.parent.addComponent(FishBait);
            this.parent.getComponentByType(Sync).authorize([bait]);
            bait.food = 5;
            bait.max = 5;
            bait.generation = -0.01;
            bait.init();
            this.physics.velocity.set(0, 0);
            this.parent.removeComponent(this);
            this.parent.removeComponent(this.parent.getComponentByType(Light));
        }
    }
}

function spawnFish(v: Vector) {
    const fish = ObjectScope.game.createObject();
    const transform = fish.addComponent(Transform);
    const drawable = fish.addComponent(PhysicsDrawable);
    const glow = fish.addComponent(Light);
    const sync = fish.addComponent(Sync);
    const physics = fish.addComponent(Physics);
    const behaviour = fish.addComponent(FishBehaviour);
    const detectable = fish.addComponent(RangeDetectable);
    const hitbox = fish.addComponent(DynamicHitbox);
    behaviour.physics = physics;
    hitbox.sides = new Vector(22, 22);
    hitbox.peek = [submarineLayer, terrainLayer];
    behaviour.hitbox = hitbox;
    behaviour.food = 10;
    glow.tint = 0x66ff99;
    drawable.url = "/assets/fish.png";
    drawable.physics = physics;
    drawable.extra = drawableExtra.background;
    transform.position.set(v.x, v.y);
    sync.authorize([transform, drawable, behaviour, physics]);
    fish.initialiseComponents();
    ObjectScope.network.scopeObject(fish);
}
