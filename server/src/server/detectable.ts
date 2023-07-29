import { BaseObject } from "@shared/baseObject";
import { SerialisedComponent, Component } from "@shared/component";
import { Sync } from "@shared/sync";

export type SerialisedDetectable = {
    sync: number
}

export type SerialisedDetectableComponent = SerialisedDetectable & SerialisedComponent;

export class Detectable extends Component {

    constructor(parent: BaseObject, id: number) {
        super(parent, id);
    }

    sync: Sync;

    override init(): void {
        super.init();
        this.sync = this.parent.getComponentByType(Sync);
    }
}

