import { BaseObject } from "@shared/baseObject";
import { Component, SerialisedComponent } from "@shared/component";
import { MarkTask } from "./mark";


export type SerialisedMissionManager = {};

export type SerialisedMissionManagerComponent = SerialisedMissionManager & SerialisedComponent;

export class MissionManager extends Component {
    constructor(parent: BaseObject, id: number) {
        super(parent, id);
    }

    override onRemove(): void {}

    override toSerialisable(): SerialisedMissionManagerComponent {
        const data = super.toSerialisable() as SerialisedMissionManagerComponent;
        return data;
    }

    override fromSerialisable(data: SerialisedMissionManagerComponent) {
        super.fromSerialisable(data);
    }
}



export function initialiseTasks(){
    MarkTask.initialise()
}