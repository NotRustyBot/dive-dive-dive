import { gravity, waterDrag } from "./constants";

export type SubStatsData = Partial<SubStats>;

export class SubStats {
    weight!: number;
    volume!: number;
    ballastVolume!: number;
    diameter!: number;
    length!: number;
    engine!: number;
    roughness!: number;
    ballastPumpRate!: number;
    leakPumpRate!: number;

    constructor(data: SubStatsData) {
        Object.assign(this, data);
        console.log(this.maxRise().toFixed(1), this.maxSink().toFixed(1), this.topSpeed().toFixed(1));
    }


    public get verticalDrag(): number {
        return (this.length * this.diameter * waterDrag) * this.roughness
    }

    public get horizontalDrag(): number {
        return (this.diameter * waterDrag) * this.roughness
    }

    maxRise() {
        const maxBuoyancy = 1 - ((this.ballastVolume + this.volume) / this.weight);
        return (gravity * maxBuoyancy) / this.verticalDrag;
    }

    maxSink() {
        const buoyancy = 1 - (this.volume / this.weight);
        return (gravity * buoyancy) / this.verticalDrag;
    }

    topSpeed() {
        return this.engine / this.horizontalDrag / this.weight;
    }

    static defaultStats() {
        return new SubStats({ diameter: 2, length: 8, volume: 20, ballastVolume: 20, weight: 30, engine: 100, roughness: 1.5, ballastPumpRate: 10, leakPumpRate: 0.1 });
    }
}
