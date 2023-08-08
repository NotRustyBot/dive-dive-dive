import { Layer } from "./physics/chunks";

export let terrainLayer: Layer;
export let fishLayer: Layer;
export let submarineLayer: Layer;


export function initCommon(){
    terrainLayer = new Layer();
    fishLayer = new Layer();
    submarineLayer = new Layer();
}