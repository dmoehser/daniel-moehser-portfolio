# Favicon Conversion Guide

## Problem: WordPress SVG Upload
WordPress blocks SVG uploads by default for security reasons.

## Solution: Convert to PNG

### Online Conversion (Recommended)
1. **Go to**: https://svgtopng.com/ or https://convertio.co/svg-png/
2. **Upload**: `favicon-512.svg`
3. **Settings**: 
   - Size: 512x512 pixels
   - Background: Transparent (or keep gradient)
   - Quality: High/Maximum
4. **Download**: PNG file
5. **Upload to WordPress**: Admin → Customizer → Site Identity → Site Icon

### Alternative Tools
- **Figma**: Import SVG → Export as PNG
- **Adobe Illustrator**: Open SVG → Export as PNG
- **Inkscape** (Free): Open SVG → Export PNG
- **Canva**: Import SVG → Download as PNG

### WordPress Settings
- **Maximum file size**: 5MB (PNG will be much smaller)
- **Recommended dimensions**: 512x512 pixels ✅
- **File format**: PNG, JPG, GIF (not SVG)

## File Naming
- Original: `favicon-512.svg`
- Converted: `favicon-512.png`
- WordPress will auto-generate: 16x16, 32x32, 180x180, etc.

## Colors in PNG
- Gradient: #38bdf8 → #a78bfa ✅
- Terminal cursor: #00ff7b ✅  
- Text: White ✅
- Background: Gradient (not transparent) ✅
