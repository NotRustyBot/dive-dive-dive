import { ClientData } from "@shared/clientData";
import { NetManager } from "@shared/netManager";
import { ObjectScope } from "@shared/objectScope";
import { Reputation } from "@shared/reputation";
import { clamp } from "@shared/utils";
import { Camera } from "camera";
import { uiLayer } from "index";
import { Text } from "pixi.js";

export class Splash {
    static standingHeading: Text;
    static standingDetail: Text;
    static init() {
        this.standingHeading = new Text("standing", { fill: 0xffffff, fontSize: 50 });
        this.standingDetail = new Text("", { fill: 0xffffff });
        this.standingDetail.alpha = 0;
        this.standingHeading.alpha = 0;
        this.standingHeading.anchor.set(0, 1);
        this.standingDetail.anchor.set(0, 0);
        uiLayer.addChild(this.standingHeading);
        uiLayer.addChild(this.standingDetail);
        ObjectScope.game.subscribe("draw", this);
    }

    private static _reputation: Reputation;
    static get currentStanding(): number {
        if (!this._reputation) this._reputation = ClientData.list.get(NetManager.identity).parent.getComponentByType(Reputation);
        return this._reputation.standing;
    }

    static standing(change: number, reason: string) {
        this.standingQueue.push({ change, reason });
        console.log("+rep");
    }

    private static standingQueue = new Array<{ change: number; reason: string }>();
    private static countdown = 0;
    static ["draw"](dt: number) {
        if (this.countdown == 0) {
            if (this.standingQueue.length > 0) this.countdown = 100;
        } else {
            this.standingDetail.position.x = -Camera.size.x / 2;
            this.standingHeading.position.x = -Camera.size.x / 2;
            this.standingHeading.alpha = clamp(0, 1, 1 - Math.abs(this.countdown - 50) / 50);
            this.standingDetail.alpha = clamp(0, 1, 1 - Math.abs(this.countdown - 50) / 30);
            const ratio = 1 - clamp(0, 1, (50 - this.countdown) / 5);
            this.standingHeading.text = "standing " + (this.currentStanding - this.standingQueue[0].change * ratio).toFixed(0);
            this.standingDetail.text = this.standingQueue[0].reason + " " + (this.standingQueue[0].change * ratio).toFixed(0);
            this.countdown -= dt * 0.3;
            if (this.countdown < 0) {
                this.countdown = 0;
                this.standingQueue.shift();
            }
        }
    }
}
