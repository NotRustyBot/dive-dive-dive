import { AutoView } from "./datagram";
import { headerId } from "./netManager";

export enum messageType {
    tick = 2,
}

export type netMessage = tickMessage

type tickMessage = {
    typeId: messageType.tick
}

export class Message {
    static tick(view: AutoView){
        view.writeUint16(headerId.message);
        view.writeUint8(messageType.tick);
    }

    static readMessage(view: AutoView): netMessage {
        const typeId: messageType = view.readUint8();
        const message: netMessage = { typeId };
        switch (typeId) {
            case messageType.tick:
                break;
        }

        return message;
    }
}