import { WebSocket, WebSocketServer } from "ws";
import { HandshakeReply, HandshakeRequest, NetManager, headerId } from "@shared/netManager";
import { AutoView } from "@shared/datagram";
import { Message, ObjectScope, ServerInfo, SubmarineBehaviour, Sync, Transform, Mission } from "./registry";
import { Client } from "./client";
import { DEV_MODE, clientSubs, createSubmarine } from "./main";
import { Detector } from "./server/detector";
import { messageType, netMessage } from "@shared/messages";
import { RangeDetector } from "./server/rangeDetector";
import { partActions } from "@shared/common";
import { MarkTask } from "./objectives/mark";
import { Vector } from "@shared/types";
import { rewardType } from "@shared/objectives";
import fs from "fs";

export class Connector {
    clients = new Map<WebSocket, Client>();
    websocket: WebSocketServer;
    motd: string = "motd";
    knownClients = new Map<number, string>();
    constructor() {
        this.websocket = new WebSocketServer({ port: 1500 });
    }

    send(view: AutoView) {
        const buffer = view.buffer.slice(0, view.index);
        for (const [socket, client] of this.clients) {
            socket.send(buffer);
        }
    }

    addClient(clientId: number, secret: string) {
        this.knownClients.set(clientId, secret);
    }

    start() {
        this.websocket.on("connection", (clientSocket) => {
            try {
                clientSocket.addListener("message", (message: Buffer) => {
                    let receiveBuffer = message.buffer.slice(message.byteOffset, message.byteOffset + message.byteLength);
                    const autoview = new AutoView(receiveBuffer);
                    while (autoview.index < receiveBuffer.byteLength) {
                        const type = autoview.readUint16();
                        switch (type) {
                            case headerId.handshake:
                                const out = NetManager.connectRequest.deserealise<HandshakeRequest>(autoview);
                                let response = "";
                                if (out.clientId == 0) {
                                    out.clientId = this.knownClients.size + 1;
                                    response = "nice to meet you";
                                    this.addClient(out.clientId, out.secret);
                                } else if (this.knownClients.get(out.clientId)) {
                                    if (this.knownClients.get(out.clientId) != out.secret) {
                                        response = "i don't think that's you";
                                        out.clientId = this.knownClients.size + 1;
                                        this.addClient(out.clientId, out.secret);
                                    } else {
                                        response = "welcome back";
                                    }
                                } else {
                                    out.clientId = this.knownClients.size + 1;
                                    response = "i don't know you";
                                    this.addClient(out.clientId, out.secret);
                                }

                                const temp = new AutoView(new ArrayBuffer(1000));
                                const client = new Client(clientSocket, out.clientId, out.secret);
                                client.setupObject();

                                if (response != "welcome back") {
                                    createSubmarine(client);
                                }
                                Detector.subscribeClient(client);

                                const mission = client.clientObject.addComponent(Mission);
                                mission.steps = [[new MarkTask(new Vector(1000, 2000), undefined)]];
                                mission.assignee = client;
                                mission.rewards = [{ type: rewardType.standing, value: 10 }];
                                mission.start();

                                temp.writeUint16(headerId.handshake);
                                NetManager.connectReply.serialise<HandshakeReply>(temp, { clientId: out.clientId, motd: this.motd, response });
                                this.clients.set(clientSocket, client);
                                console.log(response, out.clientId);
                                clientSocket.addListener("close", () => {
                                    client.socketClosed();
                                    this.clients.delete(clientSocket);
                                });
                                temp.writeUint16(headerId.objects);
                                temp.writeUint16(2);
                                ServerInfo.get().parent.getComponentByType(Sync).writeAllBits(temp);
                                client.sync.writeAllBits(temp);

                                client.send(temp);

                                break;
                            case headerId.objects:
                                const count = autoview.readUint16();
                                for (let i = 0; i < count; i++) {
                                    if (DEV_MODE) {
                                        Sync.resolveBits(autoview);
                                    } else {
                                        Sync.resolveUntrustedBits(autoview, this.clients.get(clientSocket).id);
                                    }
                                }
                                break;
                            case headerId.message:
                                const msg = Message.read(autoview);
                                this.parseMessage(msg, this.clients.get(clientSocket));
                                break;
                        }
                    }
                });
            } catch (error) {
                console.error(error);
            }
        });
    }

    parseMessage(msg: netMessage, client: Client) {
        switch (msg.typeId) {
            case messageType.debugCam:
                if (DEV_MODE) {
                    if (msg.enabled) {
                        client.debugCam = createDebugCam(client);
                    } else {
                        client.debugCam.remove();
                        client.debugCam = undefined;
                    }
                }
                break;

            case messageType.devDelete:
                if (DEV_MODE) {
                    const object = ObjectScope.network.getObject(msg.objectId);
                    object.remove();
                }
                break;

            case messageType.debugCamPosition:
                if (client.debugCam && DEV_MODE) {
                    const rangeDetector = client.debugCam.getComponentByType(RangeDetector);
                    rangeDetector.range = msg.range.mult(0.5);
                    client.debugCam.position.set(msg.position.x, msg.position.y);
                }
                break;

            case messageType.partActivity:
                const object = ObjectScope.network.getObject(msg.objectId);
                const subBehaviour = object.getComponentByType(SubmarineBehaviour);
                if (subBehaviour.owner == client.id) {
                    if (msg.action == partActions.enableSonar) subBehaviour.commands.fire("toggle-sonar", { enabled: true });
                    if (msg.action == partActions.disableSonar) subBehaviour.commands.fire("toggle-sonar", { enabled: false });
                }
                break;

            case messageType.partActivityLinkedPositioned:
                {
                    const object = ObjectScope.network.getObject(msg.objectId);
                    const subBehaviour = object.getComponentByType(SubmarineBehaviour);
                    if (subBehaviour.owner == client.id) {
                        if (msg.action == partActions.deployBeacon) subBehaviour.commands.fire("deploy-beacon", { gameId: msg.linkId, client, position: msg.position });
                    }
                }
                break;
        }
    }
}

function createDebugCam(client: Client) {
    const cam = ObjectScope.game.createObject();
    const transfrom = cam.addComponent(Transform);
    const detector = cam.addComponent(RangeDetector);
    detector.subscribe(client);

    detector.init();
    transfrom.init();

    return cam;
}
