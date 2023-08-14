import { partActions } from "@shared/common";
import { messageType } from "@shared/messages";
import { ObjectScope } from "@shared/objectScope";
import { ActiveSonarPart as MockActiveSonarPart } from "@shared/parts/activeSonar";
import { Network } from "network";
import { IUiPart, UiAction } from "ui/uiHandler";

export class ActiveSonarPart extends MockActiveSonarPart implements IUiPart {
    override ["toggle-sonar"](...params: any) {
        this.enabled = this.enabled ? 0 : 1;
        this.applyStats();
        this.invalidateCache();

        Network.message({
            typeId: messageType.partActivity,
            action: this.enabled ? partActions.enableSonar : partActions.disableSonar,
            objectId: this.parent.getId(ObjectScope.network),
        });
    }

    updateUI(button: UiAction): void {
        if (this.enabled) {
            button.container.style.background = "#55cc99";
        } else {
            button.container.style.background = "#666666";
        }
    }
}
