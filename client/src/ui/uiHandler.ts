import uiHtml from "./ui.html";
import { SubControl } from "../submarineControl";
import { ObjectScope } from "@shared/objectScope";
import { SubmarineBehaviour } from "@shared/submarine";
import { Container, Sprite, Text } from "pixi.js";
import { uiLayer } from "index";
import { Vector, Vectorlike } from "@shared/types";
import { Camera } from "camera";

type submarineAction = {
    image: string;
    name: string;
};

export class UI {
    static actionButtons = new Array<UiAction>();
    static statsHtml: HTMLDivElement;
    static get container(): Container {
        return uiLayer;
    }

    static get submarine(): SubmarineBehaviour {
        return SubControl.current.submarine;
    }

    static init() {
        document.body.innerHTML += uiHtml;
        this.setActions([{ image: "/assets/beacon.png", name: "deploy-beacon" }]);
        this.statsHtml = document.getElementsByClassName("ui-stats")[0] as HTMLDivElement;
        ObjectScope.game.subscribe("draw", this);
    }

    static ["draw"]() {
        if (!SubControl.current) return;
        if (!this.submarine) return;
        this.statsHtml.innerText = "";
        if (Math.abs(this.submarine.physics.velocity.x) < 0.2) {
            this.statsHtml.innerText += "stop\n--/--\n";
        } else {
            if (this.submarine.physics.velocity.x > 0.0) {
                this.statsHtml.innerText += "east\n";
                this.statsHtml.innerText += (2 * this.submarine.physics.velocity.x).toFixed(1) + "/" + (0.1 * this.submarine.stats.topSpeed()).toFixed(1);
                this.statsHtml.innerText += "\n";
            } else {
                this.statsHtml.innerText += "west\n";
                this.statsHtml.innerText += (-2 * this.submarine.physics.velocity.x).toFixed(1) + "/" + (0.1 * this.submarine.stats.topSpeed()).toFixed(1);
                this.statsHtml.innerText += "\n";
            }
        }

        if (Math.abs(this.submarine.physics.velocity.y) < 0.2) {
            this.statsHtml.innerText += "hover\n--/--\n";
        } else {
            if (this.submarine.physics.velocity.y > 0.0) {
                this.statsHtml.innerText += "sinking\n";
                this.statsHtml.innerText += (2 * this.submarine.physics.velocity.y).toFixed(1) + "/" + (0.1 * this.submarine.stats.maxSink()).toFixed(1);
                this.statsHtml.innerText += "\n";
            } else {
                this.statsHtml.innerText += "rising\n";
                this.statsHtml.innerText += (-2 * this.submarine.physics.velocity.y).toFixed(1) + "/" + (0.1 * this.submarine.stats.maxRise()).toFixed(1);
                this.statsHtml.innerText += "\n";
            }
        }

        this.statsHtml.innerText += ((this.submarine.battery / this.submarine.stats.battery) * 100).toFixed(1) + "%\n";
    }

    static setActions(actions: Array<submarineAction>) {
        for (const actionButton of this.actionButtons) {
            actionButton.remove();
        }

        for (const action of actions) {
            this.actionButtons.push(new UiAction(action));
        }
    }
}

class UiAction {
    container: HTMLDivElement;
    action: submarineAction;

    constructor(action: submarineAction) {
        this.action = action;
        this.createHtml();
    }

    createHtml() {
        const parent = document.getElementsByClassName("ui-actions")[0];
        this.container = document.createElement("div");
        this.container.classList.add("action-button");
        const image = document.createElement("img");
        image.src = this.action.image;
        this.container.appendChild(image);

        this.container.addEventListener("click", (e) => {
            e.stopPropagation();
            SubControl.current.submarine.commands.fire(this.action.name);
        });

        parent.appendChild(this.container);
    }

    remove() {
        this.container.remove();
    }
}

abstract class Marker {
    sprite: Sprite;
    text: Text;
    name = "";
    constructor() {
        this.sprite = Sprite.from("/assets/marker.png");
        this.text = new Text(this.name, { fill: 0xffffff, fontSize: 36, align: "center" });
        this.sprite.anchor.set(0.5);
        this.text.anchor.set(0.5, 0);
        this.text.position.set(0,36);
        this.sprite.scale.set(0.5);
        this.sprite.addChild(this.text);
        UI.container.addChild(this.sprite);
        ObjectScope.game.subscribe("draw", this);
    }

    remove() {
        this.sprite.destroy();
        ObjectScope.game.unsubscribe("draw", this);
    }

    showAt(position: Vectorlike) {
        const vector = Vector.fromLike(Camera.toScreen(position));
        const dist = Camera.position.result().mult(-1).distance(position);
        const maxDist = Math.min(Camera.size.x, Camera.size.y) * 0.8 * 0.5;
        let distText = "";
        if (dist < 10000) {
            distText = (dist / 10).toFixed(0);
        } else {
            distText = (dist / 10000).toFixed(1);
        }
        this.text.text = (this.name ? this.name + "\n" : "");

        if (dist * Camera.scale > maxDist) {
            vector.normalize().mult(maxDist);
            this.sprite.alpha = 0.5;
            this.text.text += distText;
        } else {
            this.sprite.alpha = 1;
        }

        this.sprite.position.x = vector.x;
        this.sprite.position.y = vector.y;
    }

    abstract ["draw"](dt: number): void;
}

export class Waypoint extends Marker {
    position: Vectorlike;
    constructor(position: Vectorlike) {
        super();
        this.position = position;
    }

    override ["draw"](dt: number): void {
        this.showAt(this.position);
    }
}
