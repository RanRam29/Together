"""Generate a visible demo verification document PNG. Writes bytes to stdout."""
import io
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
LOGO = ROOT / "apps" / "mobile" / "assets" / "images" / "logo.jpg"

LABELS = {
    "id_card": ("Identity document", "Demo ID card"),
    "criminal_record": ("Background check", "Demo criminal record clearance"),
    "certificate": ("Professional certificate", "Demo training certificate"),
    "degree": ("Academic degree", "Demo degree certificate"),
}


def main() -> None:
    doc_type = sys.argv[1] if len(sys.argv) > 1 else "id_card"
    title, subtitle = LABELS.get(doc_type, ("Verification document", "Demo document"))

    width, height = 900, 1200
    bg = (251, 250, 247)
    purple = (83, 74, 183)
    ink = (55, 46, 38)
    muted = (120, 116, 108)

    img = Image.new("RGB", (width, height), bg)
    draw = ImageDraw.Draw(img)

    draw.rectangle([24, 24, width - 24, height - 24], outline=purple, width=4)
    draw.rectangle([24, 24, width - 24, 140], fill=purple)

    try:
        font_lg = ImageFont.truetype("arial.ttf", 42)
        font_md = ImageFont.truetype("arial.ttf", 30)
        font_sm = ImageFont.truetype("arial.ttf", 22)
    except OSError:
        font_lg = ImageFont.load_default()
        font_md = font_lg
        font_sm = font_lg

    draw.text((48, 52), "Together / Besiluv", fill=(255, 255, 255), font=font_md)
    draw.text((48, 220), title, fill=purple, font=font_lg)
    draw.text((48, 290), subtitle, fill=ink, font=font_md)
    draw.text((48, 360), f"Document type: {doc_type}", fill=muted, font=font_sm)
    draw.text((48, 410), "DEMO ONLY — for supervisor verification testing", fill=muted, font=font_sm)

    if LOGO.exists():
        logo = Image.open(LOGO).convert("RGBA")
        logo.thumbnail((320, 320), Image.Resampling.LANCZOS)
        img.paste(logo, (width // 2 - logo.width // 2, 500), logo)

    draw.rectangle([48, 980, width - 48, 1120], outline=(15, 110, 86), width=3)
    draw.text((64, 1010), "Sample verification content", fill=(15, 110, 86), font=font_md)
    draw.text((64, 1060), "Safe to approve in test environments.", fill=ink, font=font_sm)

    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    sys.stdout.buffer.write(buf.getvalue())


if __name__ == "__main__":
    main()
