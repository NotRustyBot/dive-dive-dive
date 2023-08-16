import { BaseObject } from "../baseObject";
import { SerialisedComponent, commonDatatype } from "../component";
import { Datagram, datatype } from "../datagram";
import { NetComponent } from "../netComponent";
import { rewardType, taskId } from "../objectives";
import { Vectorlike } from "../types";

export type SerialisedMission = {
    missionId: number;
    step: number;
    tasks: Array<taskData>;
    description: string;
    rewards: Array<rewardData>;
};

export type rewardData = {
    type: rewardType;
    value: number;
};

export type taskData = {
    position?: Vectorlike;
    objectiveType: taskId;
    objectId?: number;
    ready: number;
};

export type SerialisedMissionComponent = SerialisedMission & SerialisedComponent;

export class Mission extends NetComponent {
    missionId: number;
    tasks = new Array<taskData>();
    rewards = new Array<rewardData>();
    step = 0;
    description = "desc";

    static override datagramDefinition(): void {
        super.datagramDefinition();
        const taskDatagram = new Datagram().append<taskData>({
            ready: datatype.uint8,
            position: datatype.vector32,
            objectId: commonDatatype.objectId,
            objectiveType: datatype.uint8,
        });
        const rewardDatagram = new Datagram().append<rewardData>({
            type: datatype.uint8,
            value: datatype.float32,
        });
        this.datagram = this.datagram.cloneAppend<SerialisedMission>({
            description: datatype.string,
            tasks: [datatype.array, taskDatagram],
            missionId: datatype.uint16,
            step: datatype.uint8,
            rewards: [datatype.array, rewardDatagram],
        });
        this.cacheSize = taskDatagram.calculateMinimalSize() * 5 + 180 * 2 + rewardDatagram.calculateMinimalSize() * 3;
    }

    constructor(parent: BaseObject, id: number) {
        super(parent, id);
    }

    override toSerialisable(): SerialisedMissionComponent {
        const data = super.toSerialisable() as SerialisedMissionComponent;
        data.description = this.description;
        data.step = this.step;
        data.missionId = this.missionId;
        data.tasks = this.tasks;
        data.rewards = this.rewards;
        return data;
    }

    override fromSerialisable(data: SerialisedMissionComponent) {
        super.fromSerialisable(data);
        this.description = data.description;
        this.step = data.step;
        this.missionId = data.missionId;
        this.tasks = data.tasks;
        this.rewards = data.rewards;
    }
}
