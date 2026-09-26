import os
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

# 1. Flood Embankment Breach / Inundated Waterway
w, h = 800, 500
img1 = Image.new("RGB", (w, h), (30, 41, 59))
draw1 = ImageDraw.Draw(img1)

# Water gradient
for y in range(h):
    r = int(14 + (y / h) * 10)
    g = int(75 + (y / h) * 35)
    b = int(115 + (y / h) * 30)
    draw1.line([(0, y), (w, y)], fill=(r, g, b))

# Embankment mud bank
draw1.polygon([(0, int(h * 0.45)), (int(w * 0.65), int(h * 0.3)), (w, int(h * 0.5)), (w, h), (0, h)], fill=(78, 59, 45))
# Breach water channel cutting through
draw1.polygon([(int(w * 0.28), int(h * 0.38)), (int(w * 0.45), int(h * 0.34)), (int(w * 0.52), h), (int(w * 0.22), h)], fill=(16, 85, 125))

# AI Damage detection bounding box
draw1.rectangle([int(w * 0.22), int(h * 0.32), int(w * 0.54), int(h * 0.75)], outline=(244, 63, 94), width=3)
draw1.rectangle([int(w * 0.22), int(h * 0.32) - 22, int(w * 0.48), int(h * 0.32)], fill=(244, 63, 94))
draw1.text((int(w * 0.23), int(h * 0.32) - 18), "DAMAGE: EMBANKMENT BREACH (14m)", fill=(255, 255, 255))

# Metadata stamp
draw1.rectangle([15, 15, 280, 75], fill=(15, 23, 42, 200), outline=(56, 189, 248))
draw1.text((25, 22), "ZEPHYR-01 SHUTTER CAPTURE", fill=(56, 189, 248))
draw1.text((25, 38), "LAT: 22.311400  LON: 86.315200", fill=(255, 255, 255))
draw1.text((25, 54), "ALT: 50.0m AGL  CURRENT: 1.4 m/s", fill=(245, 158, 11))

img1.save("public/flood_damage_breach.jpg", quality=90)
print("Saved public/flood_damage_breach.jpg")

# 2. Submerged Roadway Hazard
img2 = Image.new("RGB", (w, h), (25, 35, 50))
draw2 = ImageDraw.Draw(img2)

for y in range(h):
    draw2.line([(0, y), (w, y)], fill=(int(20 + y*0.03), int(45 + y*0.05), int(65 + y*0.06)))

# Submerged road line
draw2.polygon([(int(w * 0.4), 0), (int(w * 0.6), 0), (int(w * 0.75), h), (int(w * 0.25), h)], fill=(55, 65, 81))
# Flowing water over road
draw2.polygon([(int(w * 0.3), int(h * 0.35)), (w, int(h * 0.25)), (w, int(h * 0.8)), (0, int(h * 0.65))], fill=(20, 95, 135))

# Hazard box
draw2.rectangle([int(w * 0.32), int(h * 0.38), int(w * 0.68), int(h * 0.72)], outline=(245, 158, 11), width=3)
draw2.rectangle([int(w * 0.32), int(h * 0.38) - 22, int(w * 0.62), int(h * 0.38)], fill=(245, 158, 11))
draw2.text((int(w * 0.33), int(h * 0.38) - 18), "HAZARD: ROADWAY SUBMERGED (0.9m)", fill=(0, 0, 0))

draw2.rectangle([15, 15, 280, 75], fill=(15, 23, 42, 200), outline=(56, 189, 248))
draw2.text((25, 22), "ZEPHYR-01 SHUTTER CAPTURE", fill=(56, 189, 248))
draw2.text((25, 38), "LAT: 22.306100  LON: 86.322800", fill=(255, 255, 255))
draw2.text((25, 54), "ALT: 50.0m AGL  DEPTH: 0.9m SILT", fill=(245, 158, 11))

img2.save("public/flood_damage_road.jpg", quality=90)
print("Saved public/flood_damage_road.jpg")
