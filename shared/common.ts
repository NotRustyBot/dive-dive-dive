import { defineParts } from "./partDefinitions";
import { Layer } from "./physics/chunks";
import { SubStats } from "./stats";

export let terrainLayer: Layer;
export let fishLayer: Layer;
export let submarineLayer: Layer;

export function initCommon() {
    terrainLayer = new Layer();
    fishLayer = new Layer();
    submarineLayer = new Layer();

    defineParts();
}

export enum partSlot {
    hull = 1,
    system = 2,
    command = 3,
}

export enum partActions {
    deployBeacon = 1
}

type subPart = {
    name: string;
    desc: string;
    type: partTypes;
    strain: number;
    slot: partSlot;
    modification?: SubStats;
    actions?: Array<partActions>;
};

export enum partTypes {
    ballast = 0,
    smallRovHull = 1,
    largeRovHull = 2,
    smallHovHull = 3, //~5ppl
    modalHovHull = 4, //~15ppl
    largeHovHull = 5, //~50ppl
    giantHovHull = 6, //~120ppl

    basicEngine = 7, 
    basicPump = 8, 
    battery = 9, 
    beaconDeployer = 10, 
}

export class SubmarinePart {
    private static parts = new Map<partTypes, SubmarinePart>();
    slot: partSlot;
    modification: SubStats;
    actions: Array<partActions> = [];
    type: partTypes;

    constructor(data: subPart) {
        this.slot = data.slot;
        this.actions = data.actions ?? [];
        this.modification = data.modification ?? new SubStats({});
        this.type = data.type;
    }

    static create(data: subPart) {
        const part = new SubmarinePart(data);
        this.parts.set(data.type, part);
    }

    static get(type: partTypes): SubmarinePart {
        return this.parts.get(type);
    }
}

export type SubmarineAssembly = {
    part: SubmarinePart,
    count: number
}