import { BaseObject } from "./baseObject";
import { SerialisedComponent, NetComponent } from "./netComponent";
import { datatype } from "./datagram";

export type SerialisedServerInfo = {
    playerCount: number;
    mode: number;
}

export type SerialisedServerInfoComponent = SerialisedServerInfo & SerialisedComponent;

export enum serverMode {
    update = 0,
    pause = 1
}

export class ServerInfo extends NetComponent {

    private _playerCount = 0;

    public get playerCount(): number {
        return this._playerCount
    }

    public set playerCount(v: number) {
        this.invalidateCache();
        this._playerCount = v;
    }

    private _mode = serverMode.update;

    public get mode(): number {
        return this._mode
    }

    public set mode(v: number) {
        this.invalidateCache();
        this._mode = v;
    }

    private _tick = 0;

    public get tick(): number {
        return this._tick
    }

    public set tick(v: number) {
        this.invalidateCache();
        this._tick = v;
    }


    static instance: ServerInfo;
    static get() {
        return this.instance;
    }

    static override initialise(): void {
        super.initialise();
    }

    constructor(parent: BaseObject, id: number) {
        super(parent, id);
        ServerInfo.instance = this;
    }

    static override datagramDefinition(): void {
        super.datagramDefinition();
        this.datagram = this.datagram.cloneAppend<SerialisedServerInfo>({
            mode: datatype.uint8,
            playerCount: datatype.uint16
        });
        this.cacheSize = 0;
    }

    override toSerialisable(): SerialisedServerInfoComponent {
        const data = super.toSerialisable() as SerialisedServerInfoComponent;
        data.mode = this._mode;
        data.playerCount = this._playerCount;
        return data;
    }

    override fromSerialisable(data: SerialisedServerInfoComponent) {
        super.fromSerialisable(data);
        this.mode = data.mode;
        this.playerCount = data.playerCount;
    }
}

