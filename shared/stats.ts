import { SubmarineAssembly } from "./common";
import { gravity, waterDrag } from "./constants";

export type SubStatsData = Partial<SubStats>;

export class SubStats {
    weight = 0;
    volume = 0;
    ballastVolume = 0;
    diameter = 0;
    length = 0;
    engine = 0;
    roughness = 0;
    ballastPumpRate = 0;
    leakPumpRate = 0;
    space = 0;
    battery = 0;
    ballastPumpCost = 0;
    engineCost = 0;
    lightPower = 0;
    sonarPower = 0;
    passiveDraw = 0;


    constructor(data: SubStatsData) {
        Object.assign(this, data);
    }

    public get verticalDrag(): number {
        return this.length * this.diameter * waterDrag * this.roughness;
    }

    public get horizontalDrag(): number {
        return this.diameter * waterDrag * this.roughness;
    }

    maxRise() {
        const maxBuoyancy = 1 - (this.ballastVolume + this.volume) / this.weight;
        return (gravity * maxBuoyancy) / this.verticalDrag;
    }

    maxSink() {
        const buoyancy = 1 - this.volume / this.weight;
        return (gravity * buoyancy) / this.verticalDrag;
    }

    topSpeed() {
        return this.engine / this.horizontalDrag / this.weight;
    }


    addAssembly(assembly: SubmarineAssembly) {
        const other = assembly.part.modification;
        return this.addProperties(other, assembly.count)
    }

    addProperties(other: SubStats, count = 1){
        this.weight += other.weight * count;
        this.volume += other.volume * count;
        this.ballastVolume += other.ballastVolume * count;
        this.diameter += other.diameter * count;
        this.length += other.length * count;
        this.engine += other.engine * count;
        this.roughness += other.roughness * count;
        this.ballastPumpRate += other.ballastPumpRate * count;
        this.leakPumpRate += other.leakPumpRate * count;
        this.space += other.space * count;
        this.battery += other.battery * count;
        this.ballastPumpCost += other.ballastPumpCost * count;
        this.engineCost += other.engineCost * count;
        this.lightPower += other.lightPower * count;
        this.sonarPower = Math.max(this.sonarPower, other.sonarPower);
        this.passiveDraw += other.passiveDraw * count;
        return this;
    }

    sonarEffectiveRange(){
        return this.sonarPower ** 0.5;
    }

    lightEffectiveRange(){
        return this.lightPower ** 0.5;
    }

    static newHull(radius: number, length: number, roughness: number, thickness = 0.05, desnity = 7.5) {
        const volume = Math.PI * radius ** 2 * length;
        const surface = Math.PI * radius * length * 2 + 2 * Math.PI * radius ** 2;
        return new SubStats({ diameter: radius * 2, length, roughness, volume, space: volume - surface * thickness, weight: surface * thickness * desnity });
    }
}
