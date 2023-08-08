import { Container, Sprite, Texture } from "pixi.js";
import { Light as MockLight, SerialisedLightComponent } from "@shared/mock/light";
import { BaseObject } from "@shared/baseObject";
import { ObjectScope } from "@shared/objectScope";
import { lightsLayer } from "src";
import { Camera } from "./camera";

export class Light extends MockLight {
    container!: Container;
    sprite!: Sprite;

    constructor(parent: BaseObject, id: number) {
        super(parent, id);
        ObjectScope.game.subscribe("draw", this);
    }

    override onRemove(): void {
        ObjectScope.game.unsubscribe("draw", this);
        this.sprite.destroy();
    }

    override init() {
        this.sprite = Sprite.from("/assets/glow.png");
        this.sprite.anchor.set(0.5);
        this.container = new Container();
        lightsLayer.addChild(this.container);
        this.container.addChild(this.sprite);
        this.sprite.position.set(this.offset.x, this.offset.y);
    }

    ["draw"](params?: any) {
        const distsq = this.parent.position.distance(Camera.position.result().mult(-1));
        this.sprite.alpha = (this.range) / distsq;
        this.sprite.tint = this.tint;
        this.sprite.scale.set(((this.range / 22) * distsq) / 100);
        this.container.position.set(...this.parent.position.xy());
        this.container.rotation = this.parent.rotation;
    }
}
