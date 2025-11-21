# 😎 Face Overlays Feature

## Overview
The Photo Effects Studio now includes real-time face overlay effects that track your facial movements and apply fun accessories like mustaches, glasses, and party hats!

## Available Overlays

### 👨 Mustache
- Classic handlebar mustache
- Positioned below the nose using facial landmarks
- Scales based on mouth width
- Follows head movement in real-time

### 🕶️ Sunglasses
- Cool dark sunglasses
- Positioned over both eyes
- Scales based on eye distance
- Tracks face rotation and movement

### 🎩 Party Hat
- Colorful party hat with stripes
- Positioned above the forehead
- Scales based on face width
- Follows head tilts and turns

### 🤡 All
- Applies all overlays at once
- Perfect for silly photos!

## How It Works

### Facial Landmark Tracking
The overlays use 68 facial landmarks to precisely position accessories:

**Mustache Positioning:**
- Landmark 33: Nose bottom (anchor point)
- Landmarks 48-54: Mouth corners (for width calculation)
- Positioned slightly above the upper lip

**Glasses Positioning:**
- Landmarks 36-41: Left eye
- Landmarks 42-47: Right eye
- Centered between eyes with proper scaling

**Hat Positioning:**
- Landmarks 17-26: Eyebrow/forehead line
- Landmark 27: Nose top
- Positioned above the head

### Real-Time Tracking
- **60 FPS rendering** - Smooth overlay movement
- **Automatic scaling** - Adjusts to face size
- **Head movement tracking** - Follows rotations and tilts
- **Multiple faces** - Works with multiple people simultaneously

## Usage Instructions

### Step 1: Enable Face Detection
1. Toggle "Enable Face Detection" switch
2. Wait for models to load (first time only)
3. Face detection box should appear around your face

### Step 2: Choose an Overlay
1. Click one of the overlay buttons:
   - ❌ **None** - Remove all overlays
   - 👨 **Mustache** - Add mustache only
   - 🕶️ **Glasses** - Add sunglasses only
   - 🎩 **Party Hat** - Add hat only
   - 🤡 **All** - Add everything!

### Step 3: Move Your Head
- The overlays will follow your movements
- Try turning your head, tilting, or moving closer/farther
- Overlays automatically adjust size and position

### Step 4: Take Photos
- Click "📷 Take Photo" to capture
- Overlays are included in the saved image
- All effects (filters + overlays) are preserved

## Technical Details

### Landmark-Based Positioning
```javascript
// Mustache uses nose and mouth landmarks
const noseBottom = landmarks[33];
const mouthLeft = landmarks[48];
const mouthRight = landmarks[54];

// Calculate width based on mouth
const mouthWidth = Math.abs(mouthRight.x - mouthLeft.x);
const mustacheWidth = mouthWidth * 1.3;
```

### Dynamic Scaling
- Overlays scale proportionally to face size
- Maintains aspect ratio
- Adjusts for camera distance

### Performance Optimization
- SVG images for crisp rendering at any size
- Efficient landmark detection
- Cached image loading

## Assets

All overlay images are stored in the `assets/` folder:
- `mustache.svg` - Handlebar mustache graphic
- `glasses.svg` - Sunglasses with gradient lenses
- `hat.svg` - Colorful party hat

## Customization

### Adding New Overlays
To add your own overlay:

1. **Create the image** (SVG or PNG)
2. **Add to assets folder**
3. **Update JavaScript:**
```javascript
overlayImages.newOverlay = null;

// In loadOverlayImages():
{ key: 'newOverlay', src: './assets/newOverlay.svg' }

// Create draw function:
function drawNewOverlay(landmarks) {
    // Position using landmarks
    // Draw using ctx.drawImage()
}
```

4. **Add button to HTML**
5. **Update overlay logic**

### Adjusting Position
Modify the positioning multipliers in the draw functions:
```javascript
// Make mustache wider
const mustacheWidth = mouthWidth * 1.5; // was 1.3

// Move hat higher
const y = noseTop.y - hatHeight * 1.5; // was 1.3
```

## Tips for Best Results

### Lighting
- Use good lighting for better face detection
- Avoid backlighting
- Face the camera directly

### Distance
- Stay 2-3 feet from camera for best tracking
- Too close: overlays may be too large
- Too far: detection may be less accurate

### Movement
- Smooth movements work best
- Rapid head movements may cause slight lag
- Multiple faces are supported!

### Photo Quality
- Overlays are rendered at full resolution
- SVG graphics scale perfectly
- No pixelation at any size

## Troubleshooting

### Overlays Not Appearing?
- ✅ Enable face detection first
- ✅ Wait for models to load
- ✅ Ensure face is visible
- ✅ Check browser console for errors

### Overlays Misaligned?
- Improve lighting conditions
- Face camera more directly
- Move to optimal distance (2-3 feet)
- Ensure landmarks are detected (enable "Show Facial Landmarks")

### Poor Performance?
- Disable other overlays (use one at a time)
- Close other browser tabs
- Disable bounding box and confidence display
- Use a more powerful device

## Future Enhancements

Possible additions:
- More overlay options (beards, crowns, masks)
- Color customization
- Size adjustment sliders
- Rotation controls
- Custom overlay upload
- Animated overlays (blinking, moving)
- Face swap effects
- Beauty filters

## Credits

- **Overlay Graphics**: Custom SVG designs
- **Face Tracking**: face-api.js library
- **Landmark Detection**: 68-point facial landmark model
