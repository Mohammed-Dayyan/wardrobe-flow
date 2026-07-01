#!/usr/bin/env python3
"""Generate WardrobeFlow brand PNG assets (icon + transparent logo)."""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "brand"
APP_ICON = ROOT / "src" / "app" / "icon.png"

TILE_BG = (243, 240, 255, 255)
GRADIENT_LEFT = (109, 40, 217)
GRADIENT_RIGHT = (99, 102, 241)
TEXT_DARK = (30, 41, 59)
SUPERSAMPLE = 4


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def lerp_color(c1: tuple[int, int, int], c2: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return (
        int(lerp(c1[0], c2[0], t)),
        int(lerp(c1[1], c2[1], t)),
        int(lerp(c1[2], c2[2], t)),
    )


def gradient_color(x: float, x0: float, x1: float) -> tuple[int, int, int]:
    t = 0.0 if x1 == x0 else max(0.0, min(1.0, (x - x0) / (x1 - x0)))
    return lerp_color(GRADIENT_LEFT, GRADIENT_RIGHT, t)


def rounded_rect_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return mask


def arc_points(cx: float, cy: float, r: float, start: float, end: float, steps: int) -> list[tuple[float, float]]:
    pts: list[tuple[float, float]] = []
    for i in range(steps + 1):
        t = start + (end - start) * (i / steps)
        pts.append((cx + math.cos(t) * r, cy + math.sin(t) * r))
    return pts


def cubic_bezier(p0, p1, p2, p3, steps: int) -> list[tuple[float, float]]:
    pts: list[tuple[float, float]] = []
    for i in range(steps + 1):
        t = i / steps
        u = 1 - t
        x = u**3 * p0[0] + 3 * u**2 * t * p1[0] + 3 * u * t**2 * p2[0] + t**3 * p3[0]
        y = u**3 * p0[1] + 3 * u**2 * t * p1[1] + 3 * u * t**2 * p2[1] + t**3 * p3[1]
        pts.append((x, y))
    return pts


def hanger_path(scale: float, ox: float, oy: float) -> list[tuple[float, float]]:
    s = scale
    cx, cy = ox + 12 * s, oy + 5.5 * s
    hook = arc_points(cx, cy, 2.2 * s, math.pi * 1.15, math.pi * 1.85, 24)
    left_shoulder = cubic_bezier(
        hook[-1],
        (ox + 11 * s, oy + 8.5 * s),
        (ox + 9 * s, oy + 10 * s),
        (ox + 6 * s, oy + 11.5 * s),
        20,
    )
    w_bar = [
        (ox + 6 * s, oy + 11.5 * s),
        (ox + 8.2 * s, oy + 15.8 * s),
        (ox + 12 * s, oy + 13.6 * s),
        (ox + 15.8 * s, oy + 15.8 * s),
        (ox + 18 * s, oy + 11.5 * s),
    ]
    right_shoulder = cubic_bezier(
        (ox + 18 * s, oy + 11.5 * s),
        (ox + 15 * s, oy + 10 * s),
        (ox + 13 * s, oy + 8.5 * s),
        hook[0],
        20,
    )
    path = hook + left_shoulder[1:] + w_bar[1:] + right_shoulder[1:]
    return path


def draw_stroke_path(
    canvas: Image.Image,
    points: list[tuple[float, float]],
    width: float,
) -> None:
    xs = [p[0] for p in points]
    x0, x1 = min(xs), max(xs)
    int_points = [(int(round(p[0])), int(round(p[1]))) for p in points]

    mask = Image.new("L", canvas.size, 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.line(int_points, fill=255, width=int(max(round(width), 1)), joint="curve")

    cap_r = width / 2
    for px, py in (points[0], points[-1]):
        mask_draw.ellipse(
            (px - cap_r, py - cap_r, px + cap_r, py + cap_r),
            fill=255,
        )

    stroke_layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    stroke_pixels = stroke_layer.load()
    mask_pixels = mask.load()
    w, h = canvas.size
    for y in range(h):
        for x in range(w):
            alpha = mask_pixels[x, y]
            if alpha:
                color = gradient_color(x, x0, x1) + (alpha,)
                stroke_pixels[x, y] = color

    canvas.alpha_composite(stroke_layer)


def render_hanger(size: int, pad_ratio: float = 0.11, stroke_ratio: float = 0.058) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pad = int(size * pad_ratio)
    stroke = size * stroke_ratio
    inner = size - pad * 2
    scale = inner / 24.0
    ox = pad + (inner - 24 * scale) / 2
    oy = pad + (inner - 24 * scale) / 2
    points = hanger_path(scale, ox, oy)
    draw_stroke_path(img, points, stroke)
    return img


def generate_icon(size: int = 1024) -> Image.Image:
    big = size * SUPERSAMPLE
    radius = int(big * 0.22)
    tile = Image.new("RGBA", (big, big), TILE_BG)
    tile.putalpha(rounded_rect_mask(big, radius))

    hanger = render_hanger(big)
    composed = Image.alpha_composite(Image.new("RGBA", (big, big), (0, 0, 0, 0)), tile)
    composed = Image.alpha_composite(composed, hanger)
    return composed.resize((size, size), Image.Resampling.LANCZOS)


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/usr/share/fonts/truetype/inter/Inter-SemiBold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "C:/Windows/Fonts/segoeuib.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def draw_gradient_text(
    canvas: Image.Image,
    text: str,
    xy: tuple[int, int],
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
) -> None:
    tmp = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(tmp)
    draw.text(xy, text, font=font, fill=(255, 255, 255, 255))
    bbox = draw.textbbox(xy, text, font=font)
    x0, y0, x1, y1 = bbox
    grad = Image.new("RGBA", (x1 - x0, y1 - y0), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(grad)
    for x in range(x1 - x0):
        color = gradient_color(x0 + x, x0, x1) + (255,)
        gdraw.line([(x, 0), (x, y1 - y0)], fill=color)
    tmp_crop = tmp.crop(bbox)
    grad.putalpha(tmp_crop.split()[3])
    canvas.alpha_composite(grad, dest=(x0, y0))


def generate_logo(icon_size: int = 512, height: int = 512) -> Image.Image:
    icon = generate_icon(icon_size)
    font_size = int(height * 0.36)
    font = load_font(font_size)

    wardrobe = "Wardrobe"
    flow = "Flow"
    gap = int(height * 0.1)

    measure = Image.new("RGBA", (4000, height), (0, 0, 0, 0))
    mdraw = ImageDraw.Draw(measure)
    w_bbox = mdraw.textbbox((0, 0), wardrobe, font=font)
    f_bbox = mdraw.textbbox((0, 0), flow, font=font)
    text_w = (w_bbox[2] - w_bbox[0]) + (f_bbox[2] - f_bbox[0])
    text_h = max(w_bbox[3], f_bbox[3]) - min(w_bbox[1], f_bbox[1])
    total_w = icon_size + gap + text_w

    img = Image.new("RGBA", (total_w, height), (0, 0, 0, 0))
    icon_y = (height - icon_size) // 2
    img.alpha_composite(icon, dest=(0, icon_y))

    text_y = (height - text_h) // 2 - w_bbox[1] - int(height * 0.01)
    text_x = icon_size + gap
    draw = ImageDraw.Draw(img)
    draw.text((text_x, text_y), wardrobe, font=font, fill=TEXT_DARK + (255,))
    flow_x = text_x + (w_bbox[2] - w_bbox[0])
    draw_gradient_text(img, flow, (flow_x, text_y), font)
    return img


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    icon = generate_icon(1024)
    icon_path = OUT_DIR / "icon.png"
    icon.save(icon_path, "PNG", optimize=True)
    print(f"Wrote {icon_path}")

    APP_ICON.parent.mkdir(parents=True, exist_ok=True)
    icon.save(APP_ICON, "PNG", optimize=True)
    print(f"Wrote {APP_ICON}")

    logo = generate_logo(icon_size=512, height=512)
    logo_path = OUT_DIR / "logo.png"
    logo.save(logo_path, "PNG", optimize=True)
    print(f"Wrote {logo_path} ({logo.width}x{logo.height})")


if __name__ == "__main__":
    main()
