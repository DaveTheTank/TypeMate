#!/bin/bash

# Create temporary directories
mkdir -p build/tmp.iconset

# Convert SVG to PNG in different sizes
for size in 16 32 64 128 256 512 1024; do
  sips -z $size $size build/icon.png --out build/tmp.iconset/icon_${size}x${size}.png
  sips -z $((size*2)) $((size*2)) build/icon.png --out build/tmp.iconset/icon_${size}x${size}@2x.png
done

# Create icns file
iconutil -c icns build/tmp.iconset -o build/icon.icns

# Clean up
rm -rf build/tmp.iconset 