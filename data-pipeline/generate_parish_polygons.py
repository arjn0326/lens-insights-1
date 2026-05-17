"""
Generate Voronoi parish polygons clipped to Louisiana outline.
Fills gaps so the heatmap tiles the state with no white holes.
Writes src/lib/la-parish-polygons.ts for heatmap choropleth.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

import numpy as np
from shapely.geometry import LineString, MultiPoint, MultiPolygon, Point, Polygon, box
from shapely.ops import unary_union, voronoi_diagram

ROOT = Path(__file__).resolve().parents[1]
LA_GEO = ROOT / "src" / "lib" / "la-geo.ts"
LENS_DATA = ROOT / "src" / "lib" / "lens-data.ts"
OUT = ROOT / "src" / "lib" / "la-parish-polygons.ts"


def parse_la_path() -> Polygon:
    text = LA_GEO.read_text(encoding="utf-8")
    m = re.search(r'export const LA_PATH = "([^"]+)"', text)
    if not m:
        raise RuntimeError("LA_PATH not found")
    path = m.group(1)
    coords = [(float(x), float(y)) for x, y in re.findall(r"([\d.]+),([\d.]+)", path)]
    poly = Polygon(coords)
    if not poly.is_valid:
        poly = poly.buffer(0)
    return poly


def parse_parish_centroids() -> list[tuple[str, float, float]]:
    text = LENS_DATA.read_text(encoding="utf-8")
    block = text.split("export const PARISHES")[1].split("export const EMPLOYERS")[0]
    pattern = re.compile(
        r'id:\s*"([^"]+)"[^}]*?x:\s*([\d.]+),\s*y:\s*([\d.]+)',
        re.DOTALL,
    )
    rows = [(m.group(1), float(m.group(2)), float(m.group(3))) for m in pattern.finditer(block)]
    if len(rows) < 60:
        raise RuntimeError(f"Expected ~64 parishes, found {len(rows)}")
    return rows


def polygon_to_points(poly: Polygon, max_pts: int = 64) -> str:
    if poly.is_empty or poly.area < 1e-6:
        return ""
    coords = list(poly.exterior.coords)
    if len(coords) > max_pts:
        line = LineString(coords)
        distances = np.linspace(0, line.length, max_pts)
        coords = [line.interpolate(d).coords[0] for d in distances]
    return " ".join(f"{x:.2f},{y:.2f}" for x, y in coords)


def geom_to_polygons(geom, la: Polygon) -> list[Polygon]:
    """Keep every disjoint piece (parishes often have multiple fragments)."""
    if geom is None or geom.is_empty:
        return []
    clipped = geom.intersection(la) if geom.geom_type != "Polygon" else geom
    if clipped.is_empty:
        return []
    if clipped.geom_type == "Polygon":
        return [clipped]
    if clipped.geom_type == "MultiPolygon":
        return [g for g in clipped.geoms if not g.is_empty and g.area > 1e-5]
    if clipped.geom_type == "GeometryCollection":
        out: list[Polygon] = []
        for g in clipped.geoms:
            out.extend(geom_to_polygons(g, la))
        return out
    return []


def as_polygon(geom, la: Polygon) -> Polygon | MultiPolygon:
    parts = geom_to_polygons(geom, la)
    if not parts:
        return Polygon()
    if len(parts) == 1:
        return parts[0]
    from shapely.geometry import MultiPolygon

    return MultiPolygon(parts)


def union_all_polys(polys: dict[str, Polygon | MultiPolygon]) -> Polygon | MultiPolygon:
    geoms = [p for p in polys.values() if p is not None and not p.is_empty]
    if not geoms:
        return Polygon()
    return unary_union(geoms)


def assign_voronoi_cells(
    la: Polygon, parishes: list[tuple[str, float, float]]
) -> dict[str, Polygon]:
    points = [Point(x, y) for _, x, y in parishes]
    envelope = la.buffer(0.8)
    vor = voronoi_diagram(MultiPoint(points), envelope=envelope)
    cells = list(vor.geoms) if vor.geom_type == "GeometryCollection" else [vor]

    parish_polys: dict[str, Polygon] = {}
    for pid, x, y in parishes:
        pt = Point(x, y)
        best: Polygon | None = None
        best_dist = float("inf")
        for cell in cells:
            if cell.is_empty or cell.geom_type not in ("Polygon", "MultiPolygon"):
                continue
            clipped = cell.intersection(la)
            if clipped.is_empty:
                continue
            if clipped.geom_type == "MultiPolygon":
                clipped = max(clipped.geoms, key=lambda g: g.area)
            if cell.contains(pt) or cell.buffer(0.2).contains(pt):
                parish_polys[pid] = clipped
                best = None
                break
            d = cell.distance(pt)
            if d < best_dist:
                best_dist = d
                best = clipped
        if pid not in parish_polys and best is not None:
            parish_polys[pid] = best

    for pid, x, y in parishes:
        if pid not in parish_polys:
            parish_polys[pid] = Point(x, y).buffer(3.2).intersection(la)

    return parish_polys


def fill_gaps(
    la: Polygon,
    parish_polys: dict[str, Polygon],
    parishes: list[tuple[str, float, float]],
) -> dict[str, Polygon]:
    """Assign any uncovered area inside LA to the nearest parish centroid."""
    centroids = {pid: Point(x, y) for pid, x, y in parishes}

    # Slight expansion so adjacent tiles meet (removes hairline SVG gaps)
    expanded: dict[str, Polygon] = {}
    for pid, poly in parish_polys.items():
        grown = poly.buffer(0.12).intersection(la)
        if grown.is_empty:
            expanded[pid] = poly
        elif grown.geom_type == "MultiPolygon":
            expanded[pid] = max(grown.geoms, key=lambda g: g.area)
        elif grown.geom_type == "Polygon":
            expanded[pid] = grown
        else:
            expanded[pid] = poly

    cover = union_all_polys(expanded)
    gaps = la.difference(cover)

    if gaps.is_empty:
        return expanded

    gap_parts: list[Polygon] = []
    if gaps.geom_type == "Polygon":
        gap_parts = [gaps]
    elif gaps.geom_type == "MultiPolygon":
        gap_parts = list(gaps.geoms)
    elif gaps.geom_type == "GeometryCollection":
        gap_parts = [g for g in gaps.geoms if g.geom_type == "Polygon" and not g.is_empty]

    for gap in gap_parts:
        if gap.is_empty or gap.area < 1e-4:
            continue
        rep = gap.representative_point()
        nearest = min(centroids.keys(), key=lambda pid: rep.distance(centroids[pid]))
        merged = expanded[nearest].union(gap)
        expanded[nearest] = as_polygon(merged.intersection(la), la)

    # Second pass for slivers left after union
    cover2 = union_all_polys(expanded)
    gaps2 = la.difference(cover2)
    if not gaps2.is_empty:
        if gaps2.geom_type == "Polygon":
            parts2 = [gaps2]
        elif gaps2.geom_type == "MultiPolygon":
            parts2 = list(gaps2.geoms)
        else:
            parts2 = [g for g in getattr(gaps2, "geoms", []) if g.geom_type == "Polygon"]
        for gap in parts2:
            if gap.is_empty:
                continue
            rep = gap.representative_point()
            nearest = min(centroids.keys(), key=lambda pid: rep.distance(centroids[pid]))
            merged = expanded[nearest].union(gap)
            expanded[nearest] = as_polygon(merged.intersection(la), la)

    return expanded


def grid_tile_parishes(
    la: Polygon, parishes: list[tuple[str, float, float]], step: float = 0.24
) -> dict[str, Polygon]:
    """Assign every grid cell inside LA to nearest parish — full state coverage."""
    minx, miny, maxx, maxy = la.bounds
    cents = {pid: (x, y) for pid, x, y in parishes}
    tiles: dict[str, list] = {pid: [] for pid, _, _ in parishes}

    xs = np.arange(minx - step, maxx + step * 2, step)
    ys = np.arange(miny - step, maxy + step * 2, step)
    for x in xs:
        for y in ys:
            cell = box(x, y, x + step, y + step)
            if not la.intersects(cell):
                continue
            clipped = cell.intersection(la)
            if clipped.is_empty:
                continue
            cx, cy = x + step / 2, y + step / 2
            nearest = min(
                cents.keys(),
                key=lambda pid: (cx - cents[pid][0]) ** 2 + (cy - cents[pid][1]) ** 2,
            )
            if clipped.geom_type == "Polygon":
                tiles[nearest].append(clipped)
            elif clipped.geom_type == "MultiPolygon":
                tiles[nearest].extend(clipped.geoms)
            elif clipped.geom_type == "GeometryCollection":
                tiles[nearest].extend(
                    g for g in clipped.geoms if g.geom_type == "Polygon" and not g.is_empty
                )

    result: dict[str, Polygon | MultiPolygon] = {}
    for pid, _, _ in parishes:
        if tiles[pid]:
            merged = unary_union(tiles[pid]).intersection(la)
            if merged.geom_type == "Polygon":
                result[pid] = merged
            elif merged.geom_type == "MultiPolygon":
                result[pid] = merged
            else:
                result[pid] = as_polygon(merged, la)
        else:
            result[pid] = Point(cents[pid]).buffer(2.5).intersection(la)

    # Assign any leftover slivers (numeric gaps at complex coastlines)
    cover = union_all_polys(result)
    leftover = la.difference(cover)
    if not leftover.is_empty:
        parts = (
            [leftover]
            if leftover.geom_type == "Polygon"
            else list(leftover.geoms)
            if leftover.geom_type == "MultiPolygon"
            else [g for g in leftover.geoms if g.geom_type == "Polygon"]
        )
        for gap in parts:
            if gap.is_empty:
                continue
            rep = gap.representative_point()
            nearest = min(
                cents.keys(),
                key=lambda pid: (rep.x - cents[pid][0]) ** 2 + (rep.y - cents[pid][1]) ** 2,
            )
            merged = result[nearest].union(gap).intersection(la)
            if merged.geom_type == "Polygon":
                result[nearest] = merged
            elif merged.geom_type == "MultiPolygon":
                result[nearest] = merged
            else:
                result[nearest] = as_polygon(merged, la)

    return result


def main() -> None:
    la = parse_la_path()
    parishes = parse_parish_centroids()
    # Grid tiling fills LA completely (no white holes in heatmap)
    parish_polys = grid_tile_parishes(la, parishes, step=0.28)

    cover = union_all_polys(parish_polys)
    remaining = la.difference(cover)
    pct_covered = (1 - remaining.area / la.area) * 100 if la.area else 100
    print(f"Coverage: {pct_covered:.2f}% (remaining area {remaining.area:.4f})")

    lines = [
        "// Auto-generated by data-pipeline/generate_parish_polygons.py — grid tiles, full coverage.",
        "/** One or more SVG polygon point strings per parish (multipart geometries). */",
        "export const PARISH_POLYGONS: Record<string, string[]> = {",
    ]
    for pid, _, _ in sorted(parishes, key=lambda r: r[0]):
        raw = parish_polys[pid]
        simplified = raw.simplify(0.18, preserve_topology=True) if not raw.is_empty else raw
        parts = geom_to_polygons(simplified, la)
        rings = [polygon_to_points(p) for p in parts if polygon_to_points(p)]
        if not rings:
            cx, cy = next((x, y) for p, x, y in parishes if p == pid)
            rings = [polygon_to_points(Point(cx, cy).buffer(2).intersection(la))]

        lines.append(f'  "{pid}": {json.dumps(rings)},')
    lines.append("};")
    lines.append("")

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {len(parish_polys)} parish polygons to {OUT}")


if __name__ == "__main__":
    main()
