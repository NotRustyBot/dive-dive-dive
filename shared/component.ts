import { AutoView, Datagram, Template, datatype } from "./datagram";
import { BaseObject } from "./baseObject";
import { bbid } from "./bbid";
import { Vectorlike } from "./types";

export type Serialisable = {
    [k: string]: SerialisableValue
}

export type SerialisableValue = number | string | Vectorlike | Array<number> | Array<string> | Array<Serialisable>;

export interface SerialisedComponent extends Serialisable {
    typeId: number,
    id: number,
}

export const compDatatype = {
    typeId: datatype.uint16,
    compId: datatype.uint8,
}

export class Component {

    private static componentTypes: Record<number, typeof Component> = {};
    static typeId: number
    get typeId(): number {
        return (<typeof Component>this.constructor).typeId;
    }

    get datagram(): Datagram {
        return (<typeof Component>this.constructor).datagram;
    }

    get cacheSize(): number {
        return (<typeof Component>this.constructor).cacheSize;
    }

    parent: BaseObject;
    id: number;

    static initialise() {
        this.typeId = bbid(this.name);
        this.componentTypes[this.typeId] = this;
        this.datagramDefinition();
        this.cacheSize += this.datagram.calculateMinimalSize();
        console.log(this.name + ": " + this.typeId + " (" + this.cacheSize + "b)");
    }

    static cacheSize = 0;
    static datagramDefinition() {
        this.datagram.append<SerialisedComponent>({
            typeId: datatype.uint16,
            id: datatype.uint8,
        });
    }

    static datagram: Datagram = new Datagram();

    cacheView: AutoView;
    constructor(parent: BaseObject, id: number) {
        this.parent = parent;
        this.id = id;
        this.cacheView = AutoView.create(this.cacheSize);
    }

    onRemove() {
    }



    toSerialisable(): SerialisedComponent {
        const data: SerialisedComponent = { id: this.id, typeId: this.typeId }
        return data;
    }

    fromSerialisable(data: SerialisedComponent) {
        this.invalidateCache();
    }

    init() {

    }

    typeName() {
        return Component.componentTypes[this.typeId].name;
    }

    invalidateCache() {
        this.cacheValid = false;
        this.cacheId++;
        if(this.cacheId > Number.MAX_SAFE_INTEGER) this.cacheId = 0;
    }

    isCacheValid() {
       return this.cacheValid;
    }

    private cacheValid = false;
    cacheId = 0;

    writeBits(view: AutoView) {
        if (!this.cacheValid) {
            this.cacheView.index = 0;
            this.datagram.serialise(this.cacheView, this.toSerialisable());            
        }
        view.append(this.cacheView);
    }

    static createFromObject(parent: BaseObject, data: SerialisedComponent) {
        const component = new this.componentTypes[data.typeId](parent, data.id);
        return component;
    }

    static dataFromBits(view: AutoView): SerialisedComponent {
        const typeId = view.getUint16(view.index);
        return this.componentTypes[typeId].datagram.deserealise(view);
    }
}