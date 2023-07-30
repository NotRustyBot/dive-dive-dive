import { commonDatatype } from "./netComponent";
import { AutoView, Datagram, datatype } from "./datagram";
import { headerId } from "./netManager";

export enum messageType {
    tick = 2,
    untrackObject = 3,
}

export type netMessage = tickMessage | untrackObjectMessage

type tickMessage = {
    typeId: messageType.tick
}

type untrackObjectMessage = {
    typeId: messageType.untrackObject
    objectId: number
}

const messageIdDataType = datatype.uint8;

export class Message {

    private static datagrams: Record<messageType, Datagram> = {
        [messageType.tick]: new Datagram().append<tickMessage>({
            typeId: messageIdDataType
        }),

        [messageType.untrackObject]: new Datagram().append<untrackObjectMessage>({
            typeId: messageIdDataType,
            objectId: commonDatatype.objectId
        }),
    };
    static write<T extends netMessage>(view: AutoView, data: T) {
        const typeId = data.typeId;
        view.writeUint16(headerId.message);
        this.datagrams[typeId].serialise(view, data);

    }

    static read(view: AutoView): netMessage {
        const typeId: messageType = view.getUint8(view.index);
        let message: netMessage = this.datagrams[typeId].deserealise(view);

        return message;
    }
}