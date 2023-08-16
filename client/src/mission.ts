import { Mission as MockMission, SerialisedMissionComponent } from "@shared/mock/mission";
import { taskId } from "@shared/objectives";
import { Waypoint } from "ui/uiHandler";

export class Mission extends MockMission {
    waypoints = new Array<Waypoint>();
    lastStep = -1;

    override onRemove(): void {
        super.onRemove();
        for (const waypoint of this.waypoints) {
            waypoint.remove();
        }
    }

    update() {
        for (const waypoint of this.waypoints) {
            waypoint.remove();
        }

        this.waypoints = [];

        for (const task of this.tasks) {
            if (task.objectiveType == taskId.beacon){
                const wp = new Waypoint(task.position);
                this.waypoints.push(wp);
                wp.sprite.tint = 0x995500;
                wp.name = "deploy beacon"
            }
        }
    }

    override fromSerialisable(data: SerialisedMissionComponent): void {
        super.fromSerialisable(data);
        this.update();
    }
}
