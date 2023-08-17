import { bbid } from "./bbid";
import { SubmarinePart, partSlot, partTypes } from "./common";
import { ActiveSonarPart } from "./parts/activeSonar";
import { BeaconDeployerPart } from "./parts/beaconDeployer";
import { SubStats } from "./stats";

export function defineParts() {
    SubmarinePart.create({
        type: partTypes.ballast,
        name: "Ballast tank",
        desc: "A compartment where water can be pumped, making the submarine sink (as planned)",
        slot: partSlot.system,
        strain: 1,
        modification: new SubStats({ ballastVolume: 0.5, volume: -0.5, space: -0.5 }),
    });

    //#region hulls
    SubmarinePart.create({
        type: partTypes.smallRovHull,
        name: "'Witness' ROV hull",
        desc: "A small hull for a remotely operated vehicle, great for charter and survey missions.",
        slot: partSlot.hull,
        strain: 1,
        modification: SubStats.newHull(0.5, 2, 1.5, 0.02),
    });

    SubmarinePart.create({
        name: "'Nyralka' ROV hull",
        desc: "Large hull for a remotely operated vehicle, with enouch space to carry cargo or specialised equipment.",
        type: partTypes.largeRovHull,
        slot: partSlot.hull,
        strain: 1,
        modification: SubStats.newHull(0.75, 4, 1.3, 0.02),
    });

    SubmarinePart.create({
        type: partTypes.smallHovHull,
        name: "'Kurage' hull",
        desc: "Small hull for a crewed vehicle. Can be fitted for any role, but designed primarily as a research vessel.",
        slot: partSlot.hull,
        strain: 1,
        modification: SubStats.newHull(1, 8, 1.2, 0.04).addProperties(new SubStats({ lightPower: 100_000 })),
    });

    /*
    SubmarinePart.create({
        type: partTypes.modalHovHull,
        name: "'Nautile' hull",
        desc: "Medium hull for a crewed vehicle. Can be fitted for any task, including transport and mining.",
        slot: partSlot.hull,
        strain: 1,
    });

    SubmarinePart.create({
        type: partTypes.largeHovHull,
        name: "'Taigei' hull",
        desc: "Large submarine hull with enough space to serve as a multirole vehicle. Can fit a torpedo tube if needed.",
        slot: partSlot.hull,
        strain: 1,
    });

    SubmarinePart.create({
        type: partTypes.giantHovHull,
        name: "'Seawolf' superstructure",
        desc: "This massive dual-hull can be fitted for multiple primary roles. Note that many rotues cannot fit a vessel this large.",
        slot: partSlot.hull,
        strain: 1,
    });
    */
    //#endregion

    //#region engines
    SubmarinePart.create({
        type: partTypes.basicEngine,
        name: "Basic engine",
        desc: "A basic eninge.",
        slot: partSlot.system,
        strain: 1,
        modification: new SubStats({ engine: 10, weight: 1, engineCost: 0.01 }),
    });
    //#endregion

    //#region pumps
    SubmarinePart.create({
        type: partTypes.basicPump,
        name: "Basic ballast pump",
        desc: "fills and empties the ballast tank",
        slot: partSlot.system,
        strain: 1,
        modification: new SubStats({ ballastPumpRate: 1, space: -0.1, weight: 0.1, ballastPumpCost: 0.01 }),
    });
    //#endregion

    //#region battery
    SubmarinePart.create({
        type: partTypes.battery,
        name: "Battery cell",
        desc: "Small rechargable battery",
        slot: partSlot.system,
        strain: 1,
        modification: new SubStats({ battery: 10, space: -0.1, weight: 0.5 }),
    });
    //#endregion

    SubmarinePart.create({
        type: partTypes.floodlight,
        name: "Basic floodlight",
        desc: "Lights up the area",
        slot: partSlot.system,
        strain: 1,
        modification: new SubStats({ space: -0.2, weight: 0.2, lightPower: 300_000 }),
    });

    SubmarinePart.create({
        type: partTypes.sonar,
        name: "Active SONAR",
        desc: "Active system that provides information about surrounding area",
        slot: partSlot.system,
        strain: 1,
        modification: new SubStats({ space: -4, weight: 2 }),
        actions: [{image: "/assets/sonar.png", name: "toggle-sonar"}],
    });

    SubmarinePart.create({
        type: partTypes.beaconDeployer,
        name: "Beacon deployer",
        desc: "Deploys a beacon",
        slot: partSlot.system,
        strain: 1,
        modification: new SubStats({ space: -1, weight: 0.2 }),
        actions: [{image: "/assets/beacon.png", name: "deploy-beacon"}],
    });

    SubmarinePart.create({
        type: partTypes.fishFeeder,
        name: "Fish bait deployer",
        desc: "",
        slot: partSlot.system,
        strain: 1,
        modification: new SubStats({ space: -1, weight: 0.2 }),
        actions: [{image: "/assets/bait.png", name: "deploy-bait"}],
    });
}
