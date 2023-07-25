import { WebSocket, WebSocketServer } from "ws";
import { HandshakeReply, HandshakeRequest, NetManager, headerId } from "@shared/netManager"
import { AutoView } from "@shared/datagram";
import { Message, Sync } from "./registry";
import { Client } from "./client";
import { createSubmarine } from "./main";


export class Connector {
    clients = new Map<WebSocket, Client>();
    websocket: WebSocketServer;
    motd: string = "motd";
    knownClients: Record<string, string> = {};
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
                            if (out.clientId == "") {
                                out.clientId = NetManager.makeId();
                                response = "nice to meet you";
                            } else if (this.knownClients[out.clientId]) {
                                if (this.knownClients[out.clientId] != out.secret) {
                                    response = "i don't think that's you";
                                    out.clientId = NetManager.makeId();
                                } else {
                                    response = "welcome back"
                                }
                            } else {
                                out.clientId = NetManager.makeId();
                                response = "i don't know you";
                            }
                            if (response != "welcome back") {
                                createSubmarine(out.clientId);
                            }


                            this.knownClients[out.clientId] = out.secret;

                            const temp = new AutoView(new ArrayBuffer(1000));
                            const client = new Client(clientSocket, out.clientId, out.secret);
                            temp.writeUint16(headerId.handshake);
                            NetManager.connectReply.serialise<HandshakeReply>(temp, { clientId: out.clientId, motd: this.motd, response });
                            client.send(temp);
                            this.clients.set(clientSocket, client);
                            console.log(response, out.clientId);
                            clientSocket.addListener("close", () => {
                                client.socketClosed();
                                this.clients.delete(clientSocket);
                            });
                            temp.index = 0;
                            temp.writeUint16(headerId.objects);
                            temp.writeUint16(Sync.localAuthority.size);
                            for (const sync of Sync.localAuthority) {
                                sync.writeAllBits(temp)
                            }
                            client.send(temp);
                            break;
                        case headerId.objects:
                            const count = autoview.readUint16()
                            for (let i = 0; i < count; i++) {
                                Sync.resolveBits(autoview);
                            }
                            break;
                        case headerId.message:
                            const msg = Message.readMessage(autoview);
                            break;
                    }
                }
            });
        });
    }
}


