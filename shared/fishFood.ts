import { SerialisedComponent } from "./component";
import { datatype } from "./datagram";
import { NetComponent } from "./netComponent";
import { ObjectScope } from "./objectScope";

export type SerialisedFishFood = {
    food: number;
    generation: number;
    max: number;
};

export type SerialisedFishFoodComponent = SerialisedFishFood & SerialisedComponent;

export class FishFood extends NetComponent {
    food = 0;
    generation = 0;
    max = 0;

    static override datagramDefinition(): void {
        super.datagramDefinition();
        this.datagram = this.datagram.cloneAppend<SerialisedFishFood>({
            food: datatype.float32,
            generation: datatype.float32,
            max: datatype.float32,
        });
    }

    override init(): void {
        ObjectScope.game.subscribe("update", this);
    }

    ["update"](dt: number) {
        const s = dt / 60;
        this.food += this.generation * s;

        if (this.food > this.max) {
            this.food = this.max;
        }

        this.invalidateCache();
    }

    feed(bite: number) {
        const eaten = Math.min(bite, this.food);
        this.food -= eaten;
        this.invalidateCache();
        return eaten;
    }

    override onRemove(): void {
        ObjectScope.game.unsubscribe("update", this);
    }

    override toSerialisable(): SerialisedFishFoodComponent {
        const data = super.toSerialisable() as SerialisedFishFoodComponent;
        data.food = this.food;
        data.generation = this.generation;
        data.max = this.max;
        return data;
    }

    override fromSerialisable(data: SerialisedFishFoodComponent) {
        this.food = data.food;
        this.generation = data.generation;
        this.max = data.max;
        super.fromSerialisable(data);
    }
}
