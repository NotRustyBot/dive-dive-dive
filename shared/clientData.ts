import { SerialisedComponent, commonDatatype } from "./component";
import { Datagram, datatype } from "./datagram";
import { NetComponent } from "./netComponent";
import { Vectorlike } from "./types";

export type SerialisedClientData = {
    userId: number;
};

export type SerialisedClientDataComponent = SerialisedClientData & SerialisedComponent;

export class ClientData extends NetComponent {
    static list = new Map<number, ClientData>();
    userId: number;

    static override datagramDefinition(): void {
        super.datagramDefinition();

        this.datagram = this.datagram.cloneAppend<SerialisedClientData>({
            userId: commonDatatype.userId,
        });

        this.cacheSize = 10000;
    }
    override init(): void {
        ClientData.list.set(this.userId, this);
    }

    override onRemove(): void {
        ClientData.list.delete(this.userId);
    }

    override toSerialisable(): SerialisedClientDataComponent {
        const data = super.toSerialisable() as SerialisedClientDataComponent;
        data.userId = this.userId;
        return data;
    }

    override fromSerialisable(data: SerialisedClientDataComponent) {
        this.userId = data.userId;
        super.fromSerialisable(data);
    }
}
