import { NetManager as SyncManager } from "./netManager";
import { BaseObject, SerialisedBaseObject } from "./baseObject";
import { Component, SerialisedComponent, compDatatype } from "./component";
import { AutoView, Datagram, datatype } from "./datagram";
import { ObjectScope } from "./objectScope";

export type ComponentAuthority = {
    authority: string,
    id: number
}


export type SerialisedSync = {
    components: Array<ComponentAuthority>
};

export type SerialisedSyncComponent = SerialisedSync & SerialisedComponent;

class ComponentCacheInfo {
    component: Component;
    cache: Record<string, number> = {}
    constructor(component: Component) {
        this.component = component;
    }

    needsUpdate(target: string): boolean {
        const targetState = this.cache[target];
        if (targetState === this.component.cacheId) {

            return false;
        }
        this.cache[target] = this.component.cacheId;
        return true;
    }
}

export class Sync extends Component {
    static localAuthority = new Set<Sync>()
    static componentAuthority = new Datagram().append<ComponentAuthority>({
        authority: datatype.string,
        id: compDatatype.compId
    });
    cache = new Map<string, Map<number, ComponentCacheInfo>>();
    get identity(): string {
        return SyncManager.identity;
    }



    static override datagramDefinition(): void {
        super.datagramDefinition();
        this.datagram = this.datagram.cloneAppend<SerialisedSync>({
            components: [datatype.array, this.componentAuthority]
        });
        this.cacheSize = (this.componentAuthority.calculateMinimalSize() + 2 * 12) * 32;
    }

    authorize(components: Component[], authority?: string) {
        const auth = authority ?? this.identity;
        if (!this.cache.get(auth)) this.cache.set(auth, new Map());
        for (const component of components) {
            this.cache.get(auth).set(component.id, new ComponentCacheInfo(component));
        }
    }

    writeAuthorityBits(view: AutoView, target: string) {
        this.parent.writeHeaderBits(view, ObjectScope.network);
        const caches = this.cache.get(this.identity);
        const index = view.index;
        let actualSize = 0;
        view.writeUint8(caches.size);
        for (const [id, cache] of caches) {
            if (cache.needsUpdate(target)) {
                cache.component.writeBits(view);
                actualSize++;
            }
        }
        view.setUint8(index, actualSize);
    }

    writeAllBits(view: AutoView) {
        this.parent.writeHeaderBits(view, ObjectScope.network);
        view.writeUint8(this.parent.components.size);
        for (const [id, comp] of this.parent.components) {
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
            const compData = Component.dataFromBits(view);
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

    init(): void {
        this.considerLocalAuthority();
    }
}
