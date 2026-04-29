function toRadians(degrees: number) {
    return degrees * (Math.PI / 180);
}

function toDegrees(radians: number) {
    return radians * (180 / Math.PI);
}

export function calculateRelativeWaypoint(
    lat1Deg: number,
    lon1Deg: number,
    distance: number, // in meters
    bearingDeg: number // in degrees from north
): { lat: number; lng: number } {
    // WGS-84 ellipsoid parameters
    const a = 6378137; // major semi-axis
    const b = 6356752.314245; // minor semi-axis
    const f = 1 / 298.257223563; // flattening

    const α1 = toRadians(bearingDeg);
    const φ1 = toRadians(lat1Deg);
    const λ1 = toRadians(lon1Deg);

    const U1 = Math.atan((1 - f) * Math.tan(φ1));
    const sinU1 = Math.sin(U1);
    const cosU1 = Math.cos(U1);
    const sinα1 = Math.sin(α1);
    const cosα1 = Math.cos(α1);

    const sinα = cosU1 * sinα1;
    const cos2α = 1 - sinα * sinα;
    const u2 = cos2α * (a * a - b * b) / (b * b);

    const A = 1 + (u2 / 16384) * (4096 + u2 * (-768 + u2 * (320 - 175 * u2)));
    const B = (u2 / 1024) * (256 + u2 * (-128 + u2 * (74 - 47 * u2)));

    let σ = distance / (b * A);
    let σʹ, Δσ;

    let iterations = 0;
    do {
        const cos2σm = Math.cos(2 * Math.atan2(Math.tan(U1), cosα1) + σ);
        const sinσ = Math.sin(σ);
        const cosσ = Math.cos(σ);

        Δσ = B * sinσ * (cos2σm + (B / 4) * (cosσ * (-1 + 2 * cos2σm * cos2σm) -
            (B / 6) * cos2σm * (-3 + 4 * sinσ * sinσ) * (-3 + 4 * cos2σm * cos2σm)));

        σʹ = σ;
        σ = distance / (b * A) + Δσ;
    } while (Math.abs(σ - σʹ) > 1e-12 && ++iterations < 100);

    const tmp = sinU1 * Math.sin(σ) - cosU1 * Math.cos(σ) * cosα1;
    const φ2 = Math.atan2(
        sinU1 * Math.cos(σ) + cosU1 * Math.sin(σ) * cosα1,
        (1 - f) * Math.sqrt(sinα * sinα + tmp * tmp)
    );

    const λ = Math.atan2(
        Math.sin(σ) * sinα1,
        cosU1 * Math.cos(σ) - sinU1 * Math.sin(σ) * cosα1
    );

    const C = (f / 16) * cos2α * (4 + f * (4 - 3 * cos2α));
    const L = λ - (1 - C) * f * sinα * (
        σ + C * Math.sin(σ) * (Math.cos(2 * Math.atan2(Math.tan(U1), cosα1) + σ) +
            C / 4 * (Math.cos(σ) * (-1 + 2 * Math.pow(Math.cos(2 * Math.atan2(Math.tan(U1), cosα1) + σ), 2)) -
                C / 6 * Math.cos(2 * Math.atan2(Math.tan(U1), cosα1) + σ) * (-3 + 4 * Math.sin(σ) * Math.sin(σ)) *
                (-3 + 4 * Math.pow(Math.cos(2 * Math.atan2(Math.tan(U1), cosα1) + σ), 2)))));

    const λ2 = λ1 + L;

    return {
        lat: toDegrees(φ2),
        lng: toDegrees(λ2)
    };
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6378137; // meters
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
