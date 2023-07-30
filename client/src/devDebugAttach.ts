import { BaseObject, SerialisedBaseObject } from "@shared/baseObject";
import { ObjectScope } from "@shared/objectScope";
import { Container, Graphics } from "pixi.js";
import { Drawable } from "./drawable";
import { PhysicsDrawable } from "./physicsDrawable";
import { Hitbox } from "@shared/hitbox";
import { DynamicHitbox } from "@shared/dynamicHitbox";
import { Vector, Vectorlike } from "@shared/types";
import { Component, Serialisable } from "@shared/component";
import { Sync } from "@shared/sync";
import { Network } from "./network";
import { ServerInfo, serverMode } from "@shared/serverInfo";
import { Camera } from "./camera";



export class DevAttach {

    static container = new Container();
    static attached = new Set<DevAttach>();
    static lookup = new Map<BaseObject, DevAttach>();
    //not actually a parent
    parent: BaseObject;

    graphics: Graphics;

    hitbox?: Hitbox;
    drawable?: Drawable;

    static drawDebug = false;
    static showComponents = false;
    static showObjects = false;

    static button(id: string, action: (button: HTMLInputElement) => void) {
        const btn = document.getElementById(id) as HTMLInputElement;
        btn.addEventListener("click", (e) => {
            action(btn);
            e.stopPropagation();
        })
    }

    static toggle(id: string, proxy: (set?: boolean) => boolean) {
        const btn = document.getElementById(id) as HTMLInputElement;

        const action = (setTo: boolean) => {

            if (setTo) {
                proxy(true);
                btn.classList.add("on");
                btn.classList.remove("off");
            } else {
                proxy(false);
                btn.classList.remove("on");
                btn.classList.add("off");
            }
        }
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const currentState = proxy();
            action(!currentState);
        })

        return action;
    }

    static playPauseButton: HTMLInputElement;
    static init() {
        ObjectScope.game.subscribe("draw", this);
        this.playPauseButton = document.getElementById("timeStop") as HTMLInputElement;
        window.addEventListener("click", (e) => {
            this.handleClick(Camera.toWorld(e));
        });
    }

    private constructor(baseobject: BaseObject) {
        ObjectScope.game.subscribe("draw", this);
        this.parent = baseobject;
        this.graphics = new Graphics();
        DevAttach.container.addChild(this.graphics);
    }

    htmlCont: HTMLDivElement;
    updateHtml: () => void;
    static attachTo(baseobject: BaseObject) {
        const newAttached = new DevAttach(baseobject);
        DevAttach.attached.add(newAttached);
        DevAttach.lookup.set(baseobject, newAttached);
        const { container, update } = createClickableObjectInfo(newAttached.parent, () => {
            DevAttach.select(newAttached);
        });
        newAttached.htmlCont = container;
        newAttached.updateHtml = update;
        return newAttached;
    }

    static detachFrom(baseobject: BaseObject) {
        console.log("detaching");

        const toDetach = DevAttach.lookup.get(baseobject);
        DevAttach.lookup.delete(baseobject);
        DevAttach.attached.delete(toDetach);
        ObjectScope.game.unsubscribe("draw", toDetach);
        toDetach.graphics.destroy();
        if (DevAttach.selected == toDetach) DevAttach.select(undefined)
    }

    ["draw"](dt: number) {
        if (!this.hitbox) this.hitbox = this.parent.getComponentByType(Hitbox);
        if (!this.hitbox) this.hitbox = this.parent.getComponentByType(DynamicHitbox);
        if (!this.drawable) this.drawable = this.parent.getComponentByType(Drawable);
        if (!this.drawable) this.drawable = this.parent.getComponentByType(PhysicsDrawable);
        this.graphics.clear();
        this.updateHtml();
        let alpha = 0.5;
        if (this.selected) {
            alpha = 1;
            this.refreshInfo();
        }
        if (!DevAttach.drawDebug) return;

        if (this.hitbox) {
            this.graphics.lineStyle(1, "#00ffaa", alpha);
            this.graphics.drawRect(this.hitbox.x1, this.hitbox.y1, ...this.hitbox.sides.xy());


            this.graphics.lineStyle(2, "#ffaaaa", alpha);

            for (const area of this.hitbox.inAreas) {
                this.graphics.drawRect(area.gridPosition.x * this.hitbox.layer.size, area.gridPosition.y * this.hitbox.layer.size, this.hitbox.layer.size, this.hitbox.layer.size);
            }
        }

        if (this.drawable) {
            const width = this.drawable.sprite.width;
            const height = this.drawable.sprite.height;
            this.graphics.lineStyle(1, "#00aaff", alpha);
            this.graphics.drawRect(this.parent.position.x - width / 2, this.parent.position.y - height / 2, width, height);
        }
    }

    static ["draw"](dt: number) {
        DevAttach.container.position.set(Camera.position.x * Camera.scale, Camera.position.y * Camera.scale);
        DevAttach.container.scale.set(Camera.scale);



        if (ServerInfo.get() && ServerInfo.get().mode == serverMode.pause) {
            this.playPauseButton.classList.remove("on");
            this.playPauseButton.classList.add("off");
        } else {
            this.playPauseButton.classList.remove("off");
            this.playPauseButton.classList.add("on");
        }
    }

    static spriteClicks = true;
    inboud(vector: Vectorlike) {
        if (DevAttach.spriteClicks && this.drawable) {
            const width = this.drawable.sprite.width;
            const height = this.drawable.sprite.height;
            const x1 = this.parent.position.x - width / 2;
            const x2 = this.parent.position.x + width / 2;
            const y1 = this.parent.position.y - height / 2;
            const y2 = this.parent.position.y + height / 2;
            if (vector.x > x1 && vector.x < x2 && vector.y > y1 && vector.y < y2) {
                return true;
            }
        }
        return false;
    }

    static selected?: DevAttach;
    static select(attached?: DevAttach) {
        if (this.selected) this.selected.removeInfo();
        if (this.selected) this.selected.selected = false;
        if (attached) attached.selected = true;
        this.selected = attached;
        if (attached) attached.createInfo();
    }

    selected = false;

    static handleClick(mouse: Vector) {
        let nearest = undefined;
        let maxDist = Infinity;
        for (const attached of this.attached) {
            if (!attached.inboud(mouse)) continue;

            const dist = attached.parent.position.distanceSquared(mouse);
            if (dist < maxDist) {
                nearest = attached;
                maxDist = dist
            }
        }
        this.select(nearest);
    }

    removeInfo() {

        this.infoContainer?.remove();
        for (const [comp, html] of this.compInfo) {
            html.div.remove();
        }
        this.compInfo = new Map();
    }

    refreshInfo() {
        for (const [comp, html] of this.compInfo) {
            const compData = comp.toSerialisable();
            if (html.textarea == document.activeElement) continue;
            html.textarea.value = JSON.stringify(compData, null, 2);
        }
    }

    infoContainer?: HTMLDivElement;
    compInfo = new Map<Component, { div: HTMLDivElement, textarea: HTMLTextAreaElement }>();
    createInfo() {
        const netId = this.parent.getId(ObjectScope.network);
        const id = (this.parent.getId(ObjectScope.game) ?? "n/a") + (netId != undefined ? "(" + netId + ")" : "");
        const objData = this.parent.toSerialisable();
        delete objData.id;
        delete objData.componentData;
        delete objData.componentIndex;

        const place = document.getElementsByClassName("dev-information")[0]!;

        const { container } = createObjectInfo(id, "object");

        this.infoContainer = container;
        place.appendChild(container);
        for (const [id, comp] of this.parent.components) {
            const compData = comp.toSerialisable();
            const { container, textarea } = createComponentInfo(compData.id.toString(), comp.typeName(), compData, (txt) => {
                comp.fromSerialisable(JSON.parse(txt))
                const sync = comp.parent.getComponentByType(Sync);
                if (sync) {
                    Network.tempAuthority.push(sync);
                }
            });
            place.appendChild(container);
            this.compInfo.set(comp, { div: container, textarea });
        }
    }
}


function createClickableObjectInfo(object: BaseObject, select: () => void) {

    const { container, identity } = createObjectInfo("", "");
    container.addEventListener("click", (e) => {
        e.stopPropagation();
        select();
    })

    const place = document.getElementsByClassName("dev-objects")[0]!;
    place.appendChild(container);
    const update = () => {
        const netId = object.getId(ObjectScope.network);
        const id = (object.getId(ObjectScope.game) ?? "n/a") + (netId != undefined ? "(" + netId + ")" : "");
        identity.innerText = id;
        const sync = object.getComponentByType(Sync);
        if (sync) {
            if (Sync.localAuthority.has(sync)) {
                identity.classList.add("on");
                identity.classList.remove("off");
            } else {
                identity.classList.remove("off");
                identity.classList.add("off");
            }
        } else {
            identity.classList.remove("on");
            identity.classList.remove("off");
        }
    }
    return { container, update }
}


function createObjectInfo(id: string, headText: string) {
    const container = document.createElement("div");
    container.classList.add("dev-object-info");
    container.classList.add("closed");
    const identity = document.createElement("i");
    const head = document.createElement("b");
    identity.innerText = id;
    head.innerText = headText;
    container.appendChild(identity);
    container.appendChild(head);
    return { container, head, identity }
}


function createComponentInfo(id: string, headText: string, fields?: Serialisable, change?: (text: string,) => void) {
    const container = document.createElement("div");
    container.classList.add("dev-object-info");
    container.classList.add("closed");
    const identity = document.createElement("i");
    const head = document.createElement("b");
    identity.innerText = id;
    head.innerText = headText;
    container.appendChild(identity);
    container.appendChild(head);
    const textarea = document.createElement("textarea");
    textarea.value = JSON.stringify(fields, null, 2);
    textarea.style.height = textarea.value.split("\n").length * 16 + "px";
    container.appendChild(textarea);
    textarea.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    textarea.addEventListener("change", (e) => {
        change(textarea.value);
    });

    container.addEventListener("click", (e) => {
        e.stopPropagation();
        container.classList.toggle("closed");
    });
    return {
        container,
        textarea
    }
}