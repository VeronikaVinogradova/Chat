"""Sample more exact colors from the screenshot."""
from PIL import Image

SRC = "/home/z/my-project/prototype-assets/01_переход_к_уведомлению.png"
img = Image.open(SRC).convert("RGB")
w, h = img.size
RX, RY = w / 1440.0, h / 1024.0

def px(x, y):
    return "#%02X%02X%02X" % img.getpixel((int(x * RX), int(y * RY)))

samples = {
    "blue link 'Не требуется'": (697, 781),
    "green check SIP": (561, 782),
    "green badge number": (290, 781),
    "ring purple arc": (168, 199),
    "ring track": (129, 244),
    "tab underline yellow": (176, 612),
    "import border": (1118, 644),
    "header icon gray": (1274, 33),
    "table header text": (200, 728),
    "legend purple dot": (766, 373),
    "black card text gray": (1030, 396),
    "add number btn text": (1310, 659),
    "sidebar inactive icon": (28, 202),
    "row text dark": (180, 781),
    "row text gray (role col?)": (830, 781),
    "progress bar purple": (710, 373),
    "progress bar track": (900, 373),
    "yellow link black card": (1030, 454),
}
for name, (x, y) in samples.items():
    print(f"{name:32s} {px(x, y)}")
