export function clamp(min: number, max: number, x: number) {
    return Math.max(min, Math.min(max, x));
}