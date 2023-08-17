import { Mission as MockMission, SerialisedMissionComponent as MockSerialisedMissionComponent, taskData } from "@shared/mock/mission";
import { MissionTask } from "./missionTask";
import { Client } from "src/client";
import { ObjectScope } from "@shared/objectScope";
import { messageType } from "@shared/messages";
import { rewardType } from "@shared/objectives";
import { ClientData } from "@shared/clientData";
import { Connector } from "src/connector";
import { connector } from "src/main";

export type SerialisedMission = {
    steps: Array<Array<taskData>>;
    assignee: number
};

export type SerialisedMissionComponent = SerialisedMission & MockSerialisedMissionComponent;

export class Mission extends MockMission {
    assignee: Client;
    steps: Array<Array<MissionTask>>;

    start() {
        this.assignee.sync.authorize([this]);
        this.startStep();
    }

    statusUpdate() {
        this.invalidateCache();
        let done = true;
        for (const task of this.steps[this.step]) {
            if (!task.done) {
                done = false;
                break;
            }
        }

        if (done) {
            this.step++;
            this.startStep();
        } else {
            this.invalidateCache();
        }
    }

    startStep() {
        if (this.step == this.steps.length) {
            this.parent.removeComponent(this);
            this.assignee.message({ typeId: messageType.componentRemoved, componentId: this.id, objectId: this.parent.getId(ObjectScope.network) });
            this.reward();
            return;
        }

        for (const task of this.steps[this.step]) {
            task.start(this);
        }

        this.invalidateCache();
    }

    reward() {
        for (const reward of this.rewards) {
            switch (reward.type) {
                case rewardType.standing:
                    {
                        this.assignee.reputation.changeStanding(reward.value);
                        this.assignee.message({
                            typeId: messageType.standing,
                            change: reward.value,
                            reason: "Mission Complete"
                        });
                    }
                    break;
            
                default:
                    break;
            }
        }
    }

    override toSerialisable() : SerialisedMissionComponent {
        this.tasks = this.steps[this.step].map((t) => ({
            objectiveType: t.taskId,
            ready: t.done ? 1 : 0,
            objectId: t.object?.getId(ObjectScope.network) ?? 0,
            position: t.position,
        }));
        const data = super.toSerialisable() as SerialisedMissionComponent;
        data.steps = new Array<Array<taskData>>();
        data.assignee = this.assignee.id;
        for (const step of this.steps) {
            data.steps.push(step.map((t) => t.toData()) as any);
        }
        return data;
    }

    override fromSerialisable(data: SerialisedMissionComponent | MockSerialisedMissionComponent) {
        super.fromSerialisable(data);
        this.description = data.description;
        if("steps" in data){
            //this.assignee = ???
            this.steps = [];
            for (const step of data.steps) {
                const arry = new Array<MissionTask>();
                for (const taskData of step) {
                    const task = MissionTask.fromData(taskData);
                    arry.push(task);
                }
                this.steps.push(arry);
            }
            this.startStep();
        }
    }
}
