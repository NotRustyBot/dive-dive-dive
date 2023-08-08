import { BaseObject } from "../baseObject";
import { SerialisedComponent } from "../component";
import { datatype } from "../datagram";
import { NetComponent, commonDatatype } from "../netComponent";
import { Vector, Vectorlike } from "../types";
import { Drawable } from "./drawable";

export type SerialisedLight = {
    range: number;
    tint: number;
    extra: number;
    offset: Vectorlike;
};

export type SerialisedLightComponent = SerialisedLight & SerialisedComponent;

export class Light extends NetComponent {
    range = 50;
    tint = 0xffffff;
    extra = 0;
    offset = new Vector();

    static override datagramDefinition(): void {
        super.datagramDefinition();
        this.datagram = this.datagram.cloneAppend<SerialisedLight>({
            range: datatype.float32,
            tint: datatype.uint32,
            extra: datatype.uint8,
            offset: datatype.vector32
        });
        this.cacheSize = 0;
    }

    constructor(parent: BaseObject, id: number) {
        super(parent, id);
    }

    override toSerialisable(): SerialisedLightComponent {
        const data = super.toSerialisable() as SerialisedLightComponent;
        data.extra = this.extra;
        data.tint = this.tint;
        data.range = this.range;
        data.offset = this.offset;
        return data;
    }

    override fromSerialisable(data: SerialisedLightComponent) {
        this.extra = data.extra;
        this.tint = data.tint;
        this.range = data.range;
        this.offset = Vector.fromLike(data.offset);
        super.fromSerialisable(data);
    }
}
