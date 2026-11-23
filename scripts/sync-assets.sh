#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${SRC:-$HERE/../retro-style-task}"
ART="$SRC/docs/references/landing/assets/v2"
VIDEO="${VIDEO:-$SRC/screenshots/polish_v4/gameplay.mp4}"
BUILD="${BUILD:-$SRC/work/build/FoamDemoWebGL}"
SITE="$HERE/site"
IMG="$SITE/assets/img"

mkdir -p "$IMG" "$SITE/media" "$SITE/game"

webp() {
  cwebp -quiet -q "${4:-86}" -alpha_q 100 -m 6 $3 "$1" -o "$IMG/$2"
}

webp "$ART/ICN_About_RookieSlipSign.png" about-rookie-sign.webp "-crop 170 67 989 1107"
webp "$ART/ICN_About_ChiefPlant.png" about-chief-plant.webp "-crop 128 42 766 1456"
webp "$ART/ICN_Foam_Cluster.png" foam-cluster.webp "-crop 77 254 1634 406 -resize 820 0"
webp "$ART/ICN_Media_Frame.png" media-frame.webp "-crop 58 59 1555 823" 90
CORNERS="$SRC/docs/references/landing/assets/media-corners-v3/cropped"
webp "$CORNERS/ICN_Watch_Rookie_Corner.png" watch-rookie-corner.webp "-resize 788 0"
webp "$CORNERS/ICN_Watch_Chief_Corner.png" watch-chief-corner.webp "-resize 694 0"
webp "$CORNERS/ICN_Play_Rookie_Corner.png" play-rookie-corner.webp "-resize 922 0"
webp "$CORNERS/ICN_Play_Chief_Corner.png" play-chief-corner.webp "-resize 708 0"
webp "$ART/IMG_Gameplay_Poster.png" gameplay-poster.webp "" 82
cwebp -quiet -q 82 -m 6 -resize 1600 0 "$SRC/docs/references/foam-slippery-concept.png" -o "$IMG/idea-concept.webp"

FRAMES="${FRAMES:-$SRC/work/v4_video_frames}"
if [ -f "$FRAMES/f00000.png" ]; then
  ffmpeg -v error -y -framerate 30 -start_number 0 -i "$FRAMES/f%05d.png" -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -movflags +faststart "$SITE/media/gameplay.mp4"
else
  ffmpeg -v error -y -i "$VIDEO" -c copy -movflags +faststart "$SITE/media/gameplay.mp4"
fi

if [ -f "$BUILD/Build/FoamDemoWebGL.loader.js" ]; then
  rm -rf "$SITE/game/Build" "$SITE/game/StreamingAssets"
  cp -R "$BUILD/Build" "$SITE/game/Build"
  cp -R "$BUILD/StreamingAssets" "$SITE/game/StreamingAssets"
else
  echo "No WebGL build at $BUILD; the Play tab will show its unavailable state" >&2
fi

du -sh "$SITE"
find "$SITE" -type f -size +95M -print | sed 's/^/TOO LARGE FOR GIT: /'
