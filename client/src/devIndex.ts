import { ObjectScope } from "@shared/objectScope";
import { BaseObject } from "@shared/baseObject";
import { ServerInfo, serverMode } from "@shared/serverInfo";
console.log("dev enabled");

import html from "./devhtml/screen.html"
document.body.innerHTML = html;


import { app } from "./index";
import { DevAttach } from "./devDebugAttach";
import { Camera } from "./camera";

let factories: Array<string> = [];


DevAttach.init();
app.stage.addChild(DevAttach.container);
DevAttach.toggle("drawDebug", (set?: boolean) => {
    if (set != undefined) DevAttach.drawDebug = set;
    return DevAttach.drawDebug;
});

const baseDebugUrl = "http://" + window.location.hostname + ":3001/dev";

const spawnUi = document.getElementsByClassName("dev-spawn")[0];
let selectedFactory: string | undefined = undefined;

fetch(baseDebugUrl + "/factories").then(async (r) => {
    factories = JSON.parse(await r.text());
    const buttons: Array<HTMLInputElement> = [];
    for (const factory of factories) {
        const factoryButton = document.createElement("input");
        factoryButton.type = "button";
        factoryButton.value = factory;
        factoryButton.addEventListener("click", (e) => {
            e.stopPropagation();
            selectedFactory = factory;
            for (const butt of buttons) {
                butt.classList.remove("on");
            }
            factoryButton.classList.add("on");

        })
        spawnUi.appendChild(factoryButton);
        buttons.push(factoryButton);
    }
});

document.addEventListener("click", (e) => {
    if (selectedFactory && showSpawnVisible) {
        e.stopPropagation();
        const worldCoords = Camera.toWorld(e);
        fetch(baseDebugUrl + "/spawn/" + selectedFactory + `/${worldCoords.x}/${worldCoords.y}`);
    }

});

DevAttach.button("saveState", () => {
    fetch(baseDebugUrl + "/save");
});

DevAttach.button("loadState", () => {
    fetch(baseDebugUrl + "/load");
});

DevAttach.button("timeStop", () => {
    if (ServerInfo.get().mode == serverMode.pause) {
        fetch(baseDebugUrl + "/play");
    } else {
        fetch(baseDebugUrl + "/pause");
    }
});

DevAttach.button("timeStep", () => {
    fetch(baseDebugUrl + "/tick");
});


const setComponents = DevAttach.toggle("objectInfo", (set?: boolean) => {
    if (set != undefined) DevAttach.showComponents = set;
    if (DevAttach.showComponents) {
        document.getElementsByClassName("dev-information")[0].classList.remove("hidden");
        setObjects(false);
        setFactories(false);
    } else {
        document.getElementsByClassName("dev-information")[0].classList.add("hidden");
    }

    return DevAttach.showComponents;
});

const setObjects = DevAttach.toggle("objectList", (set?: boolean) => {
    if (set != undefined) DevAttach.showObjects = set;
    if (DevAttach.showObjects) {
        document.getElementsByClassName("dev-objects")[0].classList.remove("hidden");
        setComponents(false);
        setFactories(false);
    } else {
        document.getElementsByClassName("dev-objects")[0].classList.add("hidden");
    }

    return DevAttach.showObjects;
});


let showSpawnVisible = false;
const setFactories = DevAttach.toggle("objectSpawn", (set?: boolean) => {
    if (set != undefined) showSpawnVisible = set;
    if (showSpawnVisible) {
        document.getElementsByClassName("dev-spawn")[0].classList.remove("hidden");
        setComponents(false);
        setObjects(false);

    } else {
        document.getElementsByClassName("dev-spawn")[0].classList.add("hidden");
    }

    return showSpawnVisible;
});



BaseObject.attach = DevAttach.attachTo;
BaseObject.detach = DevAttach.detachFrom;


const keys: Record<string, boolean> = {}
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
})

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
})


const debugPort = 3001;
window.addEventListener("keydown", (e) => {
    if (e.key == "F8") {
        e.preventDefault();
        var data = new FormData();
        data.append("content", JSON.stringify(ObjectScope.game.toDeepSerialisable()));
        fetch("http://" + window.location.hostname + ":" + debugPort + "/data", { method: "put", body: data })
    }
});

function startDragDrop() {

    const element = document.getElementById("dropzone");
    if (!element) throw "no #dropzone found";
    element.addEventListener('dragover', (drag) => {
        element.classList.add("drag");
        drag.preventDefault();

    });
    element.addEventListener('dragleave', (drag) => {
        element.classList.remove("drag");
        drag.preventDefault();

    });

    element.addEventListener('drop', (drag) => {
        console.log("drop");
        element.classList.remove("drag");
        drag.preventDefault();
        if (drag.dataTransfer == null) return;

        if (drag.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            [...drag.dataTransfer.items].forEach((item, i) => {
                // If dropped items aren't files, reject them
                if (item.kind === "file") {
                    const file = item.getAsFile();
                    if (file) {
                        uploadFile(file, drag.pageX, drag.pageY);
                    }
                }
            });
        }
    });
}

function uploadFile(file: File, x: number, y: number) {
    let formData = new FormData();
    formData.append(file.name, file);
    fetch(baseDebugUrl + '/upload', { method: "POST", body: formData });
}

startDragDrop();