# 📸 Real-Time Photo Effects Studio

A web-based photo effects application that applies real-time filters to your webcam feed and allows you to capture photos with effects applied.

## Features

### ✨ Real-Time Effects
- **Grayscale** - Classic black and white filter
- **Sepia** - Vintage warm tone effect
- **Invert** - Color inversion effect
- **Brightness Control** - Adjust brightness from 0% to 200%
- **Contrast Control** - Adjust contrast from 0% to 200%

### 📷 Photo Capture
- Take photos with all effects applied
- Automatic download with timestamp
- High-quality PNG format

### 🛡️ Error Handling
Comprehensive error handling for:
- Camera permission denied
- No camera found
- Camera already in use
- Security restrictions
- Other camera-related errors

## How to Use

1. **Open the Application**
   - Open `index.html` in a modern web browser
   - For best results, use Chrome, Firefox, or Edge
   - Must be served over HTTPS or localhost for camera access

2. **Grant Camera Permission**
   - Allow camera access when prompted
   - The video feed will appear automatically

3. **Apply Effects**
   - Click filter buttons to apply effects (Grayscale, Sepia, Invert)
   - Use sliders to adjust brightness and contrast
   - Effects are applied in real-time

4. **Take Photos**
   - Click "📷 Take Photo" to capture the current frame
   - Photo will download automatically with effects applied
   - Click "🔄 Reset Filters" to restore default settings

## Technical Details

### Files Structure
```
EffectsStudioCV/
├── index.html      # Main HTML structure
├── styles.css      # Styling and layout
├── app.js          # JavaScript functionality
└── README.md       # Documentation
```

### Technologies Used
- **HTML5** - Canvas and Video APIs
- **CSS3** - Modern styling with gradients and animations
- **JavaScript (ES6+)** - Camera access and effect rendering
- **MediaDevices API** - Webcam access
- **Canvas API** - Real-time video processing
- **CSS Filters** - Effect application

### Browser Compatibility
- Chrome 53+
- Firefox 49+
- Edge 79+
- Safari 11+
- Opera 40+

### Camera Requirements
- Webcam or built-in camera
- Camera permissions must be granted
- HTTPS or localhost required for security

## How It Works

1. **Camera Initialization**
   - Requests camera access using `getUserMedia()`
   - Sets up video stream with optimal resolution (1280x720)
   - Handles various error scenarios

2. **Real-Time Rendering**
   - Uses `requestAnimationFrame()` for smooth 60fps rendering
   - Draws video frames to canvas continuously
   - Applies CSS filters to canvas context

3. **Effect Application**
   - Brightness: `brightness(%)` filter
   - Contrast: `contrast(%)` filter
   - Grayscale: `grayscale(100%)` filter
   - Sepia: `sepia(100%)` filter
   - Invert: `invert(100%)` filter

4. **Photo Capture**
   - Creates temporary canvas with current effects
   - Converts to PNG blob
   - Triggers automatic download

## Troubleshooting

### Camera Not Working?
- Ensure camera permissions are granted
- Check if another app is using the camera
- Try refreshing the page
- Use HTTPS or localhost (required for security)

### Effects Not Applying?
- Ensure the camera feed is active
- Try resetting filters and reapplying
- Check browser console for errors

### Photo Not Downloading?
- Check browser download settings
- Ensure pop-ups are not blocked
- Verify sufficient disk space

## Future Enhancements

Possible additions:
- More filter effects (blur, hue-rotate, saturation)
- Multiple photo gallery
- Video recording with effects
- Custom filter combinations
- Social media sharing
- Face detection and AR effects

## License

This project is open source and available for educational purposes.

## Credits

Created as a demonstration of real-time video processing using web technologies.
