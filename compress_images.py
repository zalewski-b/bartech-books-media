#!/usr/bin/env python3
"""
Konwertuje grafiki ptakow z PNG (duze, ~2MB, 896x1200) do WebP (male,
docelowo ~40-100KB, przeskalowane do 600px szerokosci) pod uzycie na karcie
w gridzie (gdzie wyswietlane sa w max ~340px szerokosci na desktopie,
600px daje margines dla ekranow Retina/HiDPI 2x).

Oryginalne PNG NIE sa usuwane - trafiaja do podfolderu 'originals/' na wypadek
gdyby przydaly sie w wyzszej rozdzielczosci do innego celu (np. wydruk).

UZYCIE:
    python3 compress_images.py
    python3 compress_images.py --images-dir inna/sciezka --width 800 --quality 85
"""

import argparse
import os
import shutil
from PIL import Image


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--images-dir", default="images/ptaki")
    parser.add_argument("--width", type=int, default=600, help="Docelowa szerokosc w px")
    parser.add_argument("--quality", type=int, default=82, help="Jakosc WebP (0-100)")
    args = parser.parse_args()

    originals_dir = os.path.join(args.images_dir, "originals")
    os.makedirs(originals_dir, exist_ok=True)

    png_files = [f for f in os.listdir(args.images_dir) if f.lower().endswith((".png", ".jpg", ".jpeg"))]

    total_before = 0
    total_after = 0
    converted = 0

    for fname in png_files:
        src_path = os.path.join(args.images_dir, fname)
        base = os.path.splitext(fname)[0]
        webp_path = os.path.join(args.images_dir, f"{base}.webp")
        original_backup_path = os.path.join(originals_dir, fname)

        size_before = os.path.getsize(src_path)
        total_before += size_before

        img = Image.open(src_path)
        if img.mode != "RGB":
            img = img.convert("RGB")

        w, h = img.size
        if w > args.width:
            new_w = args.width
            new_h = round(args.width * h / w)
            img = img.resize((new_w, new_h), Image.LANCZOS)

        img.save(webp_path, "WEBP", quality=args.quality)
        size_after = os.path.getsize(webp_path)
        total_after += size_after

        # przenosimy oryginal do originals/ (nie usuwamy, nie nadpisujemy w miejscu)
        if not os.path.exists(original_backup_path):
            shutil.move(src_path, original_backup_path)
        else:
            os.remove(src_path)

        converted += 1
        print(f"{fname}: {size_before/1024:.0f}KB -> {base}.webp: {size_after/1024:.0f}KB")

    print(f"\nPrzekonwertowano {converted} plikow.")
    print(f"Razem przed: {total_before/1024/1024:.1f}MB, po: {total_after/1024/1024:.1f}MB")
    print(f"Redukcja: {(1 - total_after/total_before)*100:.1f}%")
    print(f"Oryginaly zachowane w: {originals_dir}/")


if __name__ == "__main__":
    main()
