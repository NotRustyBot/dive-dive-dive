
import { BaseObject } from "@shared/baseObject";
import { Physics } from "@shared/physics";
import { ObjectScope } from "@shared/objectScope";
import { PhysicsDrawable as MockPhysicsDrawable } from "@shared/mock/physicsDrawable";
import { Sprite, Texture } from "pixi.js";
import { addChildByType, entityLayer } from "src";


export class PhysicsDrawable extends MockPhysicsDrawable {
    sprite!: Sprite;

    constructor(parent: BaseObject, id: number) {
        super(parent, id);
        ObjectScope.game.subscribe("draw", this);
        ObjectScope.game.subscribe("update", this);
    }

    override onRemove(): void {
        super.onRemove();
        ObjectScope.game.unsubscribe("draw", this);
        ObjectScope.game.unsubscribe("update", this);
        this.sprite.destroy();
    }

    static override initialise(): void {
        super.initialise();
    }

    ["draw"](dt: number) {
        this.sprite.position.x += this.physics.velocity.x * dt;
        this.sprite.position.y += this.physics.velocity.y * dt;
        this.sprite.rotation = this.parent.rotation;

    }

    override init() {
        this.sprite = Sprite.from(this.url);
        this.sprite.anchor.set(0.5);
        addChildByType(this.sprite, this.extra);
    }

    ["update"](dt: number) {
        this.sprite.position.set(...this.parent.position.xy());
        this.sprite.rotation = this.parent.rotation;
    }

    override fromSerialisable(data: any) {
        super.fromSerialisable(data);
        if(this.sprite) Texture.fromURL(this.url).then(texture => this.sprite.texture = texture);
    }

}