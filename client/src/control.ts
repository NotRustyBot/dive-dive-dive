import { Component, Serialisable } from "@shared/component";
import { BaseObject } from "@shared/baseObject";
import { ObjectScope } from "@shared/objectScope";



export const keys: Record<string, boolean> = {};

document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});
