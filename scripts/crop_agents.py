"""Crop agent avatars from the agents screenshot; sample chat button color."""
from PIL import Image

SRC = "/home/z/my-project/prototype-assets/04_агенты_чата.png"
OUT_DIR = "/home/z/my-project/public/agents"
import os
os.makedirs(OUT_DIR, exist_ok=True)

img = Image.open(SRC).convert("RGB")
w, h = img.size
print("size:", w, h)

# Find exact avatar rows: scan column x=1115 for dark-ish pixels groups
# From visual inspection, avatar boxes are ~36px at x≈1101..1137
# Rows (top y of each card): 205, 277, 349, 469, 541  (card h ~53)
names = ["consultant", "setter", "worker", "tg-support", "lk-support"]
tops = [213, 285, 357, 477, 549]
for name, ty in zip(names, tops):
    crop = img.crop((1101, ty, 1137, ty + 36))
    # upscale 2x for crispness on retina
    crop = crop.resize((72, 72), Image.LANCZOS)
    crop.save(f"{OUT_DIR}/{name}.png")
    print(name, "saved")

# Sample chat button color from closed screenshot
img2 = Image.open("/home/z/my-project/prototype-assets/02_чат_закрыт.png").convert("RGB")
for x, y in [(1384, 915), (1370, 925), (1400, 910)]:
    print("button px", (x, y), "#%02X%02X%02X" % img2.getpixel((x, y)))

# Sample agent card bg
print("card bg", "#%02X%02X%02X" % img.getpixel((1250, 230)))
print("panel bg", "#%02X%02X%02X" % img.getpixel((1100, 640)))
