import * as d3 from "d3";

export function createStarPath(radius: number) {
    const starPoints = 5;
    const outerR = radius;
    const innerR = radius * 0.5;

    return d3.range(0, starPoints * 2)
        .map((i) => {
            const r = i % 2 === 0 ? outerR : innerR;
            const x = Math.cos((i * 2 * Math.PI) / (starPoints * 2) - Math.PI / 2) * r;
            const y = Math.sin((i * 2 * Math.PI) / (starPoints * 2) - Math.PI / 2) * r;
            return `${x},${y}`;
        })
        .join(" ");
}

export function createCrossPath(radius: number) {
    const crossSize = radius * 1.5;
    const armWidth = radius * 0.6;

    return `
        M ${-armWidth / 2} ${-crossSize / 2}
        L ${armWidth / 2} ${-crossSize / 2}
        L ${armWidth / 2} ${-armWidth / 2}
        L ${crossSize / 2} ${-armWidth / 2}
        L ${crossSize / 2} ${armWidth / 2}
        L ${armWidth / 2} ${armWidth / 2}
        L ${armWidth / 2} ${crossSize / 2}
        L ${-armWidth / 2} ${crossSize / 2}
        L ${-armWidth / 2} ${armWidth / 2}
        L ${-crossSize / 2} ${armWidth / 2}
        L ${-crossSize / 2} ${-armWidth / 2}
        L ${-armWidth / 2} ${-armWidth / 2}
        Z
    `;
}

export function createDiamondPath(radius: number) {
    return [
        [0, -radius],
        [(radius * Math.SQRT2) / 2, 0],
        [0, radius],
        [(-radius * Math.SQRT2) / 2, 0],
    ].map((p) => p.join(",")).join(" ");
}
