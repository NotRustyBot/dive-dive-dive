import { AutoView, Datagram, datatype } from "./datagram";

export type HandshakeRequest = {
    clientId: string;
    secret: string;
}

export type HandshakeReply = {
    clientId: string;
    response: string;
    motd: string;
}


export enum headerId {
    handshake = 1,
    objects = 10,
    message = 2,
}


export class NetManager {
    static connectRequest = new Datagram();
    static connectReply = new Datagram();
    static identity = "";

    static initDatagrams() {
        this.connectRequest.append<HandshakeRequest>({
            clientId: datatype.string,
            secret: datatype.string,
        });

        this.connectReply.append<HandshakeReply>({
            clientId: datatype.string,
            response: datatype.string,
            motd: datatype.string,
        });
    }

    static makeId(length: number = 12) {
        let result = "";
        let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }


}