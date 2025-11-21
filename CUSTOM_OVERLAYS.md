# Custom Face Overlays

## Your Custom Images

The app now uses your custom overlay images instead of the default SVG files:

### Current Overlays:
1. **Mustache**: `mustache-black-mustache-png-clipart.jpg`
2. **Glasses**: `deal-with-it-glasses-11550528243wsn2x5g74t.png`
3. **Party Hat**: `db38ad985a3915441d3a10bb073773.webp`

## How It Works

The overlays are loaded from the `assets/` folder and applied in real-time to detected faces using facial landmarks.

### Positioning:
- **Mustache**: Positioned using nose bottom and mouth corners
- **Glasses**: Positioned using eye landmarks
- **Party Hat**: Positioned above the forehead

## Replacing Overlays

To use different images in the future:

### Option 1: Replace Existing Files
Simply replace the image files in the `assets/` folder with new ones using the same filenames:
- `mustache-black-mustache-png-clipart.jpg`
- `deal-with-it-glasses-11550528243wsn2x5g74t.png`
- `db38ad985a3915441d3a10bb073773.webp`

### Option 2: Update Code
Edit `app.js` lines 77-79 to point to new filenames:
```javascript
const imagesToLoad = [
    { key: 'mustache', src: './assets/your-mustache-image.png' },
    { key: 'glasses', src: './assets/your-glasses-image.png' },
    { key: 'hat', src: './assets/your-hat-image.png' }
];
```

## Supported Image Formats

The app supports all standard web image formats:
- **PNG** (best for transparency)
- **JPG/JPEG** (good for photos, no transparency)
- **WEBP** (modern format, good compression)
- **SVG** (vector graphics, scalable)
- **GIF** (animated support)

## Image Requirements

### Recommended:
- **Transparent background** (PNG or WEBP with alpha channel)
- **High resolution** (at least 400x400px)
- **Centered subject** (overlay element in center of image)
- **Optimized file size** (< 100KB for fast loading)

### Mustache Images:
- Should be horizontal
- Centered in the image
- Transparent background recommended
- Typical size: 300-500px wide

### Glasses Images:
- Should be horizontal
- Both lenses visible
- Transparent background recommended
- Typical size: 400-600px wide

### Hat Images:
- Should be upright
- Centered in the image
- Transparent background recommended
- Typical size: 350-600px wide

## Troubleshooting

### Images Not Loading?
1. Check browser console (F12) for errors
2. Verify files exist in `assets/` folder
3. Check file permissions (readable)
4. Try different image format

### Images Look Wrong?
1. **Too small/large**: Adjust image resolution
2. **Wrong position**: May need to adjust positioning code
3. **No transparency**: Use PNG with transparent background
4. **Distorted**: Check image aspect ratio

### Console Messages:
- `✅ Loaded mustache overlay (WxH)` - Success!
- `❌ Failed to load overlay` - Check file path/permissions
- `⏳ Loading overlay images...` - Still loading

## Performance Tips

1. **Optimize images**: Use tools like TinyPNG or Squoosh
2. **Use appropriate format**: PNG for transparency, JPG for photos
3. **Reasonable size**: 400-800px is usually sufficient
4. **Compress files**: Keep under 100KB when possible

## Advanced Customization

### Adjusting Overlay Size
Edit the drawing functions in `app.js`:

**Mustache** (lines ~280-295):
```javascript
const mustacheWidth = mouthWidth * 1.8;  // Adjust multiplier
const mustacheHeight = mustacheWidth * 0.4;  // Adjust ratio
```

**Glasses** (lines ~330-345):
```javascript
const glassesWidth = eyeDistance * 2.2;  // Adjust multiplier
const glassesHeight = glassesWidth * 0.4;  // Adjust ratio
```

**Hat** (lines ~380-395):
```javascript
const hatWidth = faceWidth * 1.5;  // Adjust multiplier
const hatHeight = hatWidth * 0.6;  // Adjust ratio
```

### Adjusting Overlay Position
Modify the x/y coordinates in the same functions:
```javascript
const x = centerX - overlayWidth / 2;  // Horizontal position
const y = centerY - overlayHeight / 2;  // Vertical position
```

## Adding New Overlays

To add more overlay options:

1. **Add image to assets folder**
2. **Update `loadOverlayImages()`**:
   ```javascript
   { key: 'newoverlay', src: './assets/newoverlay.png' }
   ```
3. **Add button to HTML**:
   ```html
   <button class="overlay-btn" data-overlay="newoverlay">
       <span class="overlay-icon">🎨</span>
       <span>New Overlay</span>
   </button>
   ```
4. **Add drawing function**:
   ```javascript
   function drawNewOverlay(landmarks) {
       // Position and draw your overlay
   }
   ```
5. **Call in `drawFaceOverlays()`**:
   ```javascript
   if (currentOverlay === 'newoverlay' || currentOverlay === 'all') {
       drawNewOverlay(landmarks);
   }
   ```

## Current Implementation

### File Locations:
- **Images**: `assets/` folder
- **Loading code**: `app.js` lines 73-114
- **Drawing code**: `app.js` lines 266-431
- **Buttons**: `index.html` lines 97-117

### Image Objects:
```javascript
overlayImages = {
    mustache: Image,  // Your mustache JPG
    glasses: Image,   // Your glasses PNG
    hat: Image        // Your hat WEBP
}
```

---

**Last Updated**: November 2025  
**Custom Images Added**: 3 (mustache, glasses, hat)  
**Status**: ✅ Active and working
