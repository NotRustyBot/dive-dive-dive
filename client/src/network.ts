import { HandshakeReply, HandshakeRequest, NetManager, headerId } from "@shared/netManager";
import { AutoView } from "@shared/datagram";
import { Sync } from "@shared/sync";
import { Message, messageType, netMessage } from "@shared/messages";
import { ServerInfo } from "@shared/serverInfo";


export class Network {
    static websocket: WebSocket;
    static server = "ws://10.200.140.14";
    static port = 1500;
    static ready = false;
    static autoview = new AutoView(new ArrayBuffer(1000));
    static secret = "";
    static tempAuthority: Array<Sync> = [];
    static start() {
        NetManager.identity = localStorage.getItem("sun_identity") ?? "";
        this.secret = localStorage.getItem("sun_secret") ?? NetManager.makeId(32);
        localStorage.setItem("sun_secret", this.secret);
        this.websocket = new WebSocket(`${this.server}:${this.port}`);
        this.websocket.binaryType = "arraybuffer";
        this.websocket.addEventListener("open", (e) => {
            this.autoview.index = 0;
            this.autoview.writeUint16(headerId.handshake);
            NetManager.connectRequest.serialise<HandshakeRequest>(this.autoview, {
                clientId: NetManager.identity,
                secret: this.secret
            })
            this.send();
        });
        this.websocket.addEventListener("message", this.message);
    }

    static message(message: any) {
        const view = new AutoView(message.data);
        while (view.index < view.buffer.byteLength) {

            const packetType = view.readUint16() as headerId;
            switch (packetType) {
                case headerId.handshake:
                    const result = NetManager.connectReply.deserealise<HandshakeReply>(view);
                    console.log(result.response);
                    console.log(result.motd);
                    NetManager.identity = result.clientId;
                    localStorage.setItem("sun_identity", NetManager.identity);
                    break;
                case headerId.objects:
                    const count = view.readUint16();
                    for (let i = 0; i < count; i++) {
                        Sync.resolveBits(view);
                    }
                    break;
                case headerId.message:
                    const msg = Message.readMessage(view);
                    Network.handleMessage(msg);
                    break;
            }
        }
    }

    static handleMessage(msg: netMessage) {
        switch (msg.typeId) {
            case messageType.tick:
                ServerInfo.get().tick = 1;
                break;
        }
    }

    static send() {
        if (this.websocket.readyState != this.websocket.OPEN) return
        this.websocket.send(this.autoview.buffer.slice(0, this.autoview.index));
        this.autoview.index = 0;
    }

    static sendObjects() {
        Network.autoview.writeUint16(headerId.objects);
        Network.autoview.writeUint16(Sync.localAuthority.size + Network.tempAuthority.length);

        for (const nc of Network.tempAuthority) {
            nc.writeAllBits(Network.autoview);
        }
        for (const nc of Sync.localAuthority) {
            nc.writeAuthorityBits(Network.autoview, "server");
        }

        Network.tempAuthority = [];

        this.send()
    }

}

NetManager.initDatagrams();