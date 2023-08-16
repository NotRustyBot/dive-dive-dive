import { BaseObject } from "@shared/baseObject";
import { Vector, Vectorlike } from "@shared/types";
import { taskId } from "@shared/objectives";
import { Mission } from "./mission";
import { taskData } from "@shared/mock/mission";
import { ObjectScope } from "@shared/objectScope";
import { Serialisable } from "@shared/component";
import { MarkTask } from "./mark";

export class MissionTask {
    constructor(position: Vectorlike, object: BaseObject) {
        if (position) this.position = Vector.fromLike(position);
        this.object = object;
    }

    static taskId: taskId;
    static lookup = new Map<taskId, typeof MissionTask>();
    static initialise() {
        this.lookup.set(this.taskId, this);
    }

    public get taskId(): taskId {
        return (<typeof MissionTask>this.constructor).taskId;
    }

    mission: Mission;
    done: boolean = false;
    object: BaseObject;
    position = new Vector();
    start(objective: Mission) {
        this.mission = objective;
    }

    static fromData(data: taskData) {
        const taskConstructor = MissionTask.lookup.get(data.objectiveType);
        const task = new taskConstructor(data.position, ObjectScope.network.getObject(data.objectId));
        task.done = data.ready == 1;
        return task;
    }

    toData(): Serialisable {
        return {
            objectiveType: this.taskId,
            ready: this.done ? 1 : 0,
            objectId: this.object?.getId(ObjectScope.network) ?? 0,
            position: this.position ?? { x: 0, y: 0 },
        };
    }
}
