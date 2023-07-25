import { BaseObject } from "../baseObject";
import { Component, Serialisable, SerialisedComponent } from "../component";
import { datatype } from "../datagram";



export type SerialisedDrawable = {
    url: string;
}

export type SerialisedDrawableComponent = SerialisedDrawable & SerialisedComponent;

export class Drawable extends Component {
    url!: string;
    
    
    static override datagramDefinition(): void {
        this.datagram = super.datagram.cloneAppend<SerialisedDrawable>({
            url: datatype.string
        });        
        this.cacheSize = 2 * 64;
    }

    override toSerialisable(): SerialisedDrawableComponent {
        const data = super.toSerialisable() as SerialisedDrawableComponent;
        data.url = this.url;
        return data;
    }

    override fromSerialisable(data: SerialisedDrawableComponent) {
        super.fromSerialisable(data);
        this.url = data.url;
    }
}
