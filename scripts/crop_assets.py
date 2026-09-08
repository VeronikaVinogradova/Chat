"""Crop the 3D illustration from the black SIP card of the screenshot."""
from PIL import Image

SRC = "/home/z/my-project/prototype-assets/01_переход_к_уведомлению.png"
OUT = "/home/z/my-project/public/sip-illustration.png"

img = Image.open(SRC).convert("RGBA")
w, h = img.size
print("source size:", w, h)

# Coordinates below are in the 1445x1027 reference space; scale to actual size
RX, RY = w / 1445.0, h / 1027.0

def box(x1, y1, x2, y2):
    return (int(x1 * RX), int(y1 * RY), int(x2 * RX), int(y2 * RY))

# Black card: x 984..1408, y 318..483 in the reference space.
# The illustration (globe + phone + headset) occupies the right ~40% of the card.
crop = img.crop(box(1240, 320, 1406, 481))
crop.save(OUT)
print("saved:", OUT, crop.size)

# Also sample key colors for the design system
def px(x, y):
    return img.convert("RGB").getpixel((int(x * RX), int(y * RY)))

samples = {
    "page bg": (720, 950),
    "card bg": (400, 340),
    "yellow button": (1310, 659),
    "black card bg": (1100, 340),
    "purple progress": (720, 373),
    "table row border": (700, 812),
    "search bg": (200, 659),
    "sidebar active icon": (28, 151),
    "title text": (110, 118),
}
for name, (x, y) in samples.items():
    print(name, "#%02X%02X%02X" % px(x, y))
