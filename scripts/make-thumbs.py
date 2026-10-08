import random
from pathlib import Path
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"
THUMB = IMG / "thumb"
SIZE = 240


def make_thumbs():
    THUMB.mkdir(exist_ok=True)
    total = 0
    for src in sorted(IMG.glob("*.webp")):
        if src.name.startswith("mascot"):
            continue
        im = Image.open(src).convert("RGB")
        side = min(im.size)
        left, top = (im.width - side) // 2, (im.height - side) // 2
        im = im.crop((left, top, left + side, top + side)).resize((SIZE, SIZE), Image.LANCZOS)
        im = im.filter(ImageFilter.GaussianBlur(2.2))
        out = THUMB / src.name
        im.save(out, "WEBP", quality=55, method=6)
        total += out.stat().st_size
    print(f"thumbs: {total / 1024:.0f} KB")


def make_grain():
    rng = random.Random(7)
    size, step = 128, 32
    im = Image.new("L", (size, size))
    # 8 grey levels: random noise is incompressible, so quantising is what keeps the tile small
    im.putdata([max(0, min(255, round(rng.gauss(128, 42) / step) * step)) for _ in range(size * size)])
    out = IMG / "grain.png"
    im.save(out, optimize=True)
    print(f"grain.png: {out.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    make_thumbs()
    make_grain()
