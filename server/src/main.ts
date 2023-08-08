import { AutoView } from "@shared/datagram";
import { Connector } from "./connector";
import { DynamicHitbox, Hitbox, Message, NetManager, ObjectScope, Physics, PhysicsDrawable, ServerInfo, SubControl, SubmarineBehaviour, Sync, Transform } from "./registry";
import { Layer } from "@shared/physics/chunks";
import { headerId } from "@shared/netManager";
import { Vector } from "@shared/types";
import { startDevServer } from "./devserver";
import { serverMode } from "@shared/serverInfo";
import { messageType } from "@shared/messages";
import { initCommon, submarineLayer, terrainLayer } from "@shared/common";
import { Detector } from "./server/detector";
import { Detectable } from "./server/detectable";
import { RangeDetector } from "./server/rangeDetector";
import { RangeDetectable } from "./server/rangeDetectable";
import { Client } from "./client";
import { drawableExtra } from "@shared/mock/drawable";

initCommon();

startDevServer();
NetManager.initDatagrams();
NetManager.identity = 0;
export const connector = new Connector();
connector.start();
console.log("ready");
const game = ObjectScope.game;

export enum physicsLayerEnum {
    collision,
    detectable,
}

export const physicsLayers: Record<physicsLayerEnum, Layer> = {
    [physicsLayerEnum.collision]: new Layer(),
    [physicsLayerEnum.detectable]: new Layer(),
};

function createInfoObject() {
    const serverInfoObject = ObjectScope.network.createObject();
    const serverInfo = serverInfoObject.addComponent(ServerInfo);
    const serverInfoSync = serverInfoObject.addComponent(Sync);
    serverInfoSync.authorize([serverInfo], NetManager.identity);
    serverInfoSync.init();
    serverInfo.init();
}

createInfoObject();

export const clientSubs = new Map<number, SubmarineBehaviour>();
export function createSubmarine(client: Client) {
    const sub = game.createObject();
    const net = sub.addComponent(Sync);
    const hitbox = sub.addComponent(DynamicHitbox);
    const control = sub.addComponent(SubControl);
    const physics = sub.addComponent(Physics);
    const drawable = sub.addComponent(PhysicsDrawable);
    const submarine = sub.addComponent(SubmarineBehaviour);
    const transform = sub.addComponent(Transform);
    const detector = sub.addComponent(RangeDetector);
    const detectable = sub.addComponent(RangeDetectable);
    control.submarine = submarine;
    submarine.physics = physics;
    submarine.owner = client.id;
    drawable.physics = physics;
    submarine.hitbox = hitbox;
    hitbox.sides = new Vector(250, 100);
    drawable.url = "/assets/brandy.png";
    drawable.extra = drawableExtra.entity;
    hitbox.peek = [terrainLayer, submarineLayer];
    hitbox.poke = [submarineLayer];
    net.authorize([submarine, transform, drawable, physics]);
    net.authorize([control], client.id);
    detector.subscribe(client);
    detector.range = new Vector(4000, 4000);
    physics.init();
    hitbox.init();
    control.init();
    drawable.init();
    net.init();
    submarine.init();
    detector.init();
    detectable.init();
    ObjectScope.network.scopeObject(sub);
    clientSubs.set(client.id, submarine);

    return sub;
}

const tps = 20;
const sendView = new AutoView(new ArrayBuffer(1000000));
setInterval(() => {
    const serverInfo = ServerInfo.get();
    if (serverInfo.mode == serverMode.update || (serverInfo.mode == serverMode.pause && serverInfo.tick == 1)) {
        const dt = 1 / tps;
        game.fire("input");
        game.fire("update", dt * 60);
        game.fire("collisions", dt * 60);
        game.fire("physics", dt * 60);
        game.fire("post-collision", dt * 60);
    }

    Detector.processAll();
    sendView.index = 0;

    sendView.writeUint16(headerId.objects);
    const sbindex = sendView.index;
    sendView.writeUint16(0);

    if (ServerInfo.get().parent.getComponentByType(Sync).writeAuthorityBits(sendView)) {
        sendView.setUint16(sbindex, 1);
    }

    const bindex = sendView.index;

    for (const [_, client] of connector.clients) {
        sendView.index = bindex;
        if (serverInfo.tick != 0) Message.write(sendView, { typeId: messageType.tick });

        client.writeMessages(sendView);
        client.writeObjects(sendView);
        client.send(sendView);
    }

    if (serverInfo.tick == 1) serverInfo.tick = 0;
}, 1000 / tps);

export function clearAll() {
    for (const [sw, client] of connector.clients) {
        client.untrackAll();
    }

    Sync.localAuthority.clear();

    for (const [id, bo] of ObjectScope.network.baseObjects) {
        bo.remove();
    }

    for (const [id, layer] of Layer.list) {
        for (const [aid, area] of layer.areas) {
            area.members.clear();
        }
        layer.areas.clear();
    }

    ObjectScope.network.clear();
}
