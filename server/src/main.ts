import { AutoView } from "@shared/datagram";
import { Connector } from "./connector";
import { DynamicHitbox, Hitbox, Message, NetManager, ObjectScope, Physics, PhysicsDrawable, ServerInfo, SubControl, SubmarineBehaviour, Sync, Transform } from "./registry";
import { Layer } from "@shared/physics/chunks";
import { headerId } from "@shared/netManager";
import { Vector } from "@shared/types";
import { startDevServer } from "./devserver";
import { serverMode } from "@shared/serverInfo";


startDevServer();

NetManager.initDatagrams();
NetManager.identity = "server";
const connector = new Connector();
connector.start();
console.log("ready");
const game = ObjectScope.game;
const terrainLayer = new Layer();

export let serverInfo: ServerInfo;
function createInfoObject() {
    const serverInfoObject = ObjectScope.network.createObject();
    serverInfo = serverInfoObject.addComponent(ServerInfo);
    const sync = serverInfoObject.addComponent(Sync);
    sync.authorize([serverInfo], NetManager.identity);
    sync.init();
    serverInfo.init();
}

createInfoObject();

export function createSubmarine(authority: string) {
    const sub = game.createObject();
    const net = sub.addComponent(Sync);
    const hitbox = sub.addComponent(DynamicHitbox);
    const control = sub.addComponent(SubControl);
    const physics = sub.addComponent(Physics);
    const drawable = sub.addComponent(PhysicsDrawable);
    const submarine = sub.addComponent(SubmarineBehaviour);
    const transform = sub.addComponent(Transform);
    control.submarine = submarine;
    submarine.physics = physics;
    drawable.physics = physics;
    submarine.hitbox = hitbox;
    hitbox.sides = new Vector(250, 100);
    drawable.url = "/assets/brandy.png";
    hitbox.layerId = 0;
    net.authorize([submarine, transform]);
    net.authorize([control], authority);
    physics.init();
    hitbox.init();
    control.init();
    drawable.init();
    net.init();
    submarine.init();

    ObjectScope.network.scopeObject(sub);

    return sub;
}

const tps = 20;
const sendView = new AutoView(new ArrayBuffer(1000));
setInterval(() => {
    if (serverInfo.mode == serverMode.update || (serverInfo.mode == serverMode.pause && serverInfo.tick == 1)) {
        const dt = 1 / tps;
        game.fire("input");
        game.fire("update", dt * 60);
        game.fire("collisions", dt * 60);
        game.fire("physics", dt * 60);
        game.fire("post-collision", dt * 60);

    }


    for (const [_, client] of connector.clients) {
        sendView.index = 0;
        if(serverInfo.tick != 0) Message.tick(sendView);
        sendView.writeUint16(headerId.objects);
        sendView.writeUint16(Sync.localAuthority.size);
        //#perf
        for (const sync of Sync.localAuthority) {
            if (sync.cache.has(client.id)) {
                sync.writeAuthorityBits(sendView, client.id);
            } else {
                sync.writeAllBits(sendView);
            }
        }
        client.send(sendView);
    }

    if(serverInfo.tick == 1) serverInfo.tick = 0;

}, 1000 / tps);