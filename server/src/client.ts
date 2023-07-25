import { AutoView } from "@shared/datagram";
import { WebSocket } from "ws";
import { Sync } from "./registry";

export class Client {

    private socket: WebSocket;
    private secret: string;
    id: string;

    known = Array<Sync>();

    constructor(socket: WebSocket, id: string, secret: string) {
        this.socket = socket;
        this.secret = secret;
        this.id = id;
    }
    send(view: AutoView){
        const buffer = view.buffer.slice(0, view.index);
        this.socket.send(buffer);
    }

    socketClosed() {
        //ok??
    }
}