import { SerialisedComponent, commonDatatype } from "./component";
import { Datagram, datatype } from "./datagram";
import { NetComponent } from "./netComponent";

type userReference = {
    userId: number;
    value: number;
};

export type SerialisedReputation = {
    userApproval: Array<userReference>;
    standing: number;
};

export type SerialisedReputationComponent = SerialisedReputation & SerialisedComponent;

export class Reputation extends NetComponent {
    standing = 0;
    userApproval = new Map<number, boolean>();

    approve(userId: number) {
        this.userApproval.set(userId, true);
        this.invalidateCache();
    }

    disapprove(userId: number) {
        this.userApproval.set(userId, false);
        this.invalidateCache();
    }

    indifferent(userId: number) {
        this.userApproval.delete(userId);
        this.invalidateCache();
    }

    changeStanding(change: number) {
        this.standing += change;
        this.invalidateCache();
    }

    static override datagramDefinition(): void {
        super.datagramDefinition();
        const userReferenceDatagram = new Datagram().append<userReference>({
            userId: commonDatatype.userId,
            value: datatype.int8,
        });
        this.datagram = this.datagram.cloneAppend<SerialisedReputation>({
            userApproval: [datatype.array, userReferenceDatagram],
            standing: datatype.float32,
        });
        this.cacheSize = userReferenceDatagram.calculateMinimalSize() * 1000;
    }

    override toSerialisable(): SerialisedReputationComponent {
        const data = super.toSerialisable() as SerialisedReputationComponent;
        data.standing = this.standing;
        data.userApproval = [];

        for (const [user, approval] of this.userApproval) {
            data.userApproval.push({ userId: user, value: approval ? 1 : 0 });
        }
        return data;
    }

    override fromSerialisable(data: SerialisedReputationComponent) {
        super.fromSerialisable(data);
        this.standing = data.standing;
        this.userApproval.clear();
        for (const record of data.userApproval) {
            this.userApproval.set(record.userId, record.value == 1);
        }
    }
}
