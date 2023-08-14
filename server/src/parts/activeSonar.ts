import { ActiveSonarPart as MockActiveSonarPart } from "@shared/parts/activeSonar";

export class ActiveSonarPart extends MockActiveSonarPart {
    override ["toggle-sonar"](params: any) {
        this.enabled = params.enabled ? 1 : 0;
        this.applyStats();
        this.invalidateCache();
    }
}
