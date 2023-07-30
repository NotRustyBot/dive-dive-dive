import { ObjectScope } from "@shared/objectScope";

export const keys: Record<string, number> = {};

document.addEventListener("keydown", (e) => {
    if (!keys[e.key]) keys[e.key] = .1;
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = 0;
});


const keyManager = {
    ["input"]() {
        for (const k in keys) {
            if (keys[k] == .1) {
                keys[k] = 1;
                continue;
            }

            if (keys[k]) keys[k]++;
        }
    }
}

ObjectScope.game.subscribe("input", keyManager);