import { NetManager as SyncManager } from "./netManager";
import { BaseObject, SerialisedBaseObject } from "./baseObject";
import { NetComponent, SerialisedComponent, commonDatatype } from "./netComponent";
import { AutoView, Datagram, datatype } from "./datagram";
import { ObjectScope } from "./objectScope";

export type ComponentAuthority = {
    authority: number,
    id: number
}

export type SerialisedSync = {
    components: Array<ComponentAuthority>
};

export type SerialisedSyncComponent = SerialisedSync & SerialisedComponent;

class ComponentCacheInfo {
    component: NetComponent;
    cache: Record<number, number> = {}
    constructor(component: NetComponent) {
        this.component = component;
    }

    needsUpdate(target: number): boolean {
        const targetState = this.cache[target];
        if (targetState === this.component.cacheId) {

            return false;
        }
        this.cache[target] = this.component.cacheId;
        return true;
    }
}

export class Sync extends NetComponent {
    static localAuthority = new Set<Sync>()
    static componentAuthority = new Datagram().append<ComponentAuthority>({
        authority: datatype.uint32,
        id: commonDatatype.compId
    });
    cache = new Map<number, Map<number, ComponentCacheInfo>>();
    get identity(): number {
        return SyncManager.identity;
    }

    static override datagramDefinition(): void {
        super.datagramDefinition();
        this.datagram = this.datagram.cloneAppend<SerialisedSync>({
            components: [datatype.array, this.componentAuthority]
        });
        this.cacheSize = (this.componentAuthority.calculateMinimalSize() + 2 * 12) * 32;
    }

    override onRemove(): void {
        Sync.localAuthority.delete(this);
    }

    authorize(components: NetComponent[], authority?: number) {
        const auth = authority ?? this.identity;
        if (!this.cache.get(auth)) this.cache.set(auth, new Map());
        for (const component of components) {
            this.cache.get(auth).set(component.id, new ComponentCacheInfo(component));
        }
    }

    clearCache(identity: number) {
        this.cache.delete(identity);
    }

    writeAuthorityBits(view: AutoView, target?: number) {
        const bindex = view.index;
        this.parent.writeHeaderBits(view, ObjectScope.network);
        const caches = this.cache.get(this.identity);
        const index = view.index;
        let actualSize = 0;
        view.writeUint8(caches.size);
        for (const [id, cache] of caches) {
            if (!target || cache.needsUpdate(target)) {
                cache.component.writeBits(view);
                actualSize++;
            }
        }
        
        view.setUint8(index, actualSize);

        if(actualSize == 0) {
            view.index = bindex;
            return false;
        }

        return true;
    }

    writeAllBits(view: AutoView) {
        this.parent.writeHeaderBits(view, ObjectScope.network);
        view.writeUint8(this.parent.netComponents.size);
        for (const [id, comp] of this.parent.netComponents) {
            comp.writeBits(view);
        }
    }

    static resolveBits(view: AutoView) {
        const data = BaseObject.getHeaderFromBits(view) as SerialisedBaseObject;
        let parent = ObjectScope.network.getObject(data.id);
        data.componentData = [];
        const compCount = view.readUint8();
        if (!parent) {
            parent = ObjectScope.game.createObject();
            ObjectScope.network.setObject(parent, data.id);
        }

        for (let i = 0; i < compCount; i++) {
            const compData = NetComponent.dataFromBits(view);
            data.componentData.push(compData);
        }

        parent.applyData(data as SerialisedBaseObject);
        return parent;
    }

    override toSerialisable(): SerialisedSyncComponent {
        const data = super.toSerialisable() as SerialisedSyncComponent;
        const compas: Array<ComponentAuthority> = [];

        for (const [authority, caches] of this.cache) {
            for (const [id, cache] of caches) {
                compas.push({ authority, id: cache.component.id });
            }
        }

        data.components = compas;
        return data;
    }

    override fromSerialisable(data: SerialisedSyncComponent) {
        super.fromSerialisable(data);
        for (const comp of data.components) {
            if (!this.cache.has(comp.authority)) this.cache.set(comp.authority, new Map())
            if (!this.cache.get(comp.authority).has(comp.id))
                this.cache.get(comp.authority).set(comp.id, new ComponentCacheInfo(this.parent.getComponent(comp.id)));
        }
        this.considerLocalAuthority();
    }

    considerLocalAuthority() {
        if (this.cache.has(this.identity)) {
            Sync.localAuthority.add(this);
        } else {
            Sync.localAuthority.delete(this);
        }
    }

    override init(): void {
        this.considerLocalAuthority();
    }
}
