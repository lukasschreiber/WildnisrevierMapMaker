import { Vector } from "../../utils/vector";

export interface SmoothPoint {
    x: number;
    y: number;
    notsmooth?: boolean;
}

export function smoothControlPoints(points: SmoothPoint[], edgeRatio: number = 0.333): Vector[] {
    const cp: Vector[] = [];
    const n = points.length;

    if (n <= 1) {
        return cp;
    }

    let eprev = new Vector(points[0].x, points[0].y).sub(new Vector(points[n - 1].x, points[n - 1].y));
    let lenprev = eprev.mag();

    if (lenprev === 0) {
        return cp;
    }

    eprev = eprev.scale(1 / lenprev);

    for (let i = 0; i < n; i++) {
        const point = points[i];
        const inext = (i + 1) % n;
        const nextPoint = points[inext];

        let enext = new Vector(nextPoint.x, nextPoint.y).sub(new Vector(point.x, point.y));
        const lennext = enext.mag();

        if (lennext === 0) {
            continue;
        }

        enext = enext.scale(1 / lennext);

        let tangent = eprev.add(enext).normalize();

        if (tangent.dot(enext) < 0) {
            tangent = new Vector(0, 0).sub(tangent);
        }

        if (point.notsmooth) {
            cp.push(
                new Vector(point.x, point.y),
                new Vector(point.x, point.y),
                new Vector(point.x, point.y),
            );
        } else {
            cp.push(
                new Vector(point.x, point.y).sub(tangent.scale(lenprev * edgeRatio)),
                new Vector(point.x, point.y),
                new Vector(point.x, point.y).add(tangent.scale(lennext * edgeRatio)),
            );
        }

        eprev = enext;
        lenprev = lennext;
    }

    return cp;
}
