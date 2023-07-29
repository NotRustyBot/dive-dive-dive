import { AutoView } from "@shared/datagram";
import { WebSocket } from "ws";
import { Message, ObjectScope, Sync } from "./registry";
import { headerId } from "@shared/netManager";
import { messageType, netMessage } from "@shared/messages";
import { Detectable } from "./server/detectable";
import { IncidentRotuer, trippable } from "@shared/incident";

type tracking = { initialised: boolean, wasTracked: boolean }

export class Client {


    private socket: WebSocket;
    private secret: string;
    id: number;

    tracked = new Map<Detectable, tracking>();

    messages: Array<netMessage> = [];

    constructor(socket: WebSocket, id: number, secret: string) {
        this.socket = socket;
        this.secret = secret;
        this.id = id;
    }

    send(view: AutoView) {
        const buffer = view.buffer.slice(0, view.index);
        this.socket.send(buffer);
    }

    track(detectable: Detectable) {
        if (detectable == undefined) {
            console.log("what");
            
        }
        if (!this.tracked.has(detectable)) {
            this.tracked.set(detectable, { initialised: false, wasTracked: true });
        } else {
            this.tracked.get(detectable).wasTracked = true;
        }
    }

    untrack(detectable: Detectable) {
        const tracked = this.tracked.get(detectable);
        if (tracked) {
            this.messages.push({
                typeId: messageType.untrackObject,
                objectId: detectable.sync.parent.getId(ObjectScope.network)
            });
            this.tracked.delete(detectable);
        }
    }

    untrackAll() {
        for (const [detectable, _] of this.tracked) {
            this.untrack(detectable);
        }
    }

    writeObjects(view: AutoView) {
        view.writeUint16(headerId.objects);
        const index = view.index;
        let actualSize = 0;
        view.writeUint16(0);
        for (const [detectable, tracked] of this.tracked) {
            if (!tracked.wasTracked) {
                this.untrack(detectable);
            }

            const sync = detectable.sync;
            if (tracked.initialised) {
                const serialised = sync.writeAuthorityBits(view, this.id);
                if (serialised) actualSize++;
            } else {
                sync.writeAllBits(view);
                tracked.initialised = true;
                actualSize++;
            }

            tracked.wasTracked = false;
        }
        view.setUint16(index, actualSize);
    }

    writeMessages(view: AutoView) {
        for (const msg of this.messages) {
            Message.write(view, msg);
        }
        this.messages = [];
    }

    private incidentRouter = new IncidentRotuer();

    subscribe<K extends string>(name: K, component: trippable<K>) {
        this.incidentRouter.subscribe(name, component);
    }

    unsubscribe<K extends string>(name: K, component: trippable<K>) {
        this.incidentRouter.unsubscribe(name, component);
    }

    fire(name: string, params?: any) {
        this.incidentRouter.fire(name, params);
    }

    socketClosed() {
        this.incidentRouter.fire("disconnect", this);
    }
}