import { WebSocket, WebSocketServer } from "ws";
import { HandshakeReply, HandshakeRequest, NetManager, headerId } from "@shared/netManager"
import { AutoView } from "@shared/datagram";
import { Message, ObjectScope, ServerInfo, Sync } from "./registry";
import { Client } from "./client";
import { createSubmarine } from "./main";
import { Detector } from "./server/detector";
import { messageType } from "@shared/messages";


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

    start() {
        console.log("listening ...");

        this.websocket.on('connection', (clientSocket) => {
            try {


                clientSocket.addListener("message", (message: Buffer) => {
                    let receiveBuffer = message.buffer.slice(
                        message.byteOffset,
                        message.byteOffset + message.byteLength
                    );
                    const autoview = new AutoView(receiveBuffer);
                    while (autoview.index < receiveBuffer.byteLength) {
                        const type = autoview.readUint16()
                        switch (type) {
                            case headerId.handshake:
                                const out = NetManager.connectRequest.deserealise<HandshakeRequest>(autoview);
                                let response = "";
                                if (out.clientId == 0) {
                                    out.clientId = this.knownClients.size + 1;
                                    response = "nice to meet you";
                                } else if (this.knownClients.get(out.clientId)) {
                                    if (this.knownClients.get(out.clientId) != out.secret) {
                                        response = "i don't think that's you";
                                        out.clientId = this.knownClients.size + 1;
                                    } else {
                                        response = "welcome back"
                                    }
                                } else {
                                    out.clientId = this.knownClients.size + 1;
                                    response = "i don't know you";
                                }

                                this.knownClients.set(out.clientId, out.secret);

                                const temp = new AutoView(new ArrayBuffer(1000));
                                const client = new Client(clientSocket, out.clientId, out.secret);
                                if (response != "welcome back") {
                                    createSubmarine(client);
                                } else {
                                    Detector.subscribeClient(client);
                                }
                                temp.writeUint16(headerId.handshake);
                                NetManager.connectReply.serialise<HandshakeReply>(temp, { clientId: out.clientId, motd: this.motd, response });
                                this.clients.set(clientSocket, client);
                                console.log(response, out.clientId);
                                clientSocket.addListener("close", () => {
                                    client.socketClosed();
                                    this.clients.delete(clientSocket);
                                });
                                temp.writeUint16(headerId.objects);
                                temp.writeUint16(1);
                                ServerInfo.get().parent.getComponentByType(Sync).writeAllBits(temp);

                                client.send(temp);

                                break;
                            case headerId.objects:
                                const count = autoview.readUint16()
                                for (let i = 0; i < count; i++) {
                                    Sync.resolveBits(autoview);
                                }
                                break;
                            case headerId.message:
                                const msg = Message.read(autoview);
                                break;
                        }
                    }
                });
            } catch (error) {
                console.error(error);
                
            }
        });
    }
}


