# Making Overlay Images Transparent

## The Problem

Your current overlay images have backgrounds that show up on the face:

- **Mustache**: `mustache-black-mustache-png-clipart.jpg` (JPG format - **no transparency support**)
- **Glasses**: `deal-with-it-glasses-11550528243wsn2x5g74t.png` (PNG - should support transparency)
- **Hat**: `db38ad985a3915441d3a10bb073773.webp` (WEBP - should support transparency)

**JPG files cannot have transparent backgrounds!** You need to convert them to PNG or WEBP format.

## Quick Solution

### Option 1: Use Online Tools (Easiest)

#### Remove.bg (Best for photos)
1. Go to https://www.remove.bg/
2. Upload your image
3. It automatically removes the background
4. Download as PNG
5. Replace the file in your `assets/` folder

#### Photopea (Free Photoshop Alternative)
1. Go to https://www.photopea.com/
2. Open your image (File → Open)
3. Use Magic Wand tool to select background
4. Press Delete to remove background
5. Export as PNG (File → Export As → PNG)
6. Replace the file in your `assets/` folder

#### Other Free Tools:
- **Canva**: https://www.canva.com/features/background-remover/
- **Pixlr**: https://pixlr.com/remove-background/
- **Cleanup.pictures**: https://cleanup.pictures/

### Option 2: Use Desktop Software

#### GIMP (Free)
1. Download from https://www.gimp.org/
2. Open your image
3. Right-click layer → Add Alpha Channel
4. Use "Select by Color" tool
5. Click background color
6. Press Delete
7. Export as PNG

#### Photoshop
1. Open image
2. Use Magic Wand or Quick Selection tool
3. Select background
4. Delete
5. Save as PNG

#### Paint.NET (Windows)
1. Download from https://www.getpaint.net/
2. Open image
3. Use Magic Wand tool
4. Select background
5. Delete
6. Save as PNG

## File Format Requirements

### ✅ Formats That Support Transparency:
- **PNG** (Recommended) - Best quality, widely supported
- **WEBP** - Modern format, good compression
- **GIF** - Limited colors, not recommended for photos

### ❌ Formats That DON'T Support Transparency:
- **JPG/JPEG** - Always has solid background
- **BMP** - No transparency support

## Step-by-Step: Converting Your Mustache

Since your mustache is currently a JPG, here's how to fix it:

### Method 1: Remove.bg (Fastest)
1. Go to https://www.remove.bg/
2. Click "Upload Image"
3. Select `mustache-black-mustache-png-clipart.jpg`
4. Wait for processing (automatic)
5. Click "Download" (free for low resolution)
6. Save as `mustache.png`
7. Replace in `assets/` folder

### Method 2: Photopea (More Control)
1. Go to https://www.photopea.com/
2. File → Open → Select your mustache JPG
3. Click "Magic Wand" tool (W key)
4. Click on the white/background area
5. Press Delete key
6. If there's still background:
   - Select → Grow (by 1-2 pixels)
   - Press Delete again
7. File → Export As → PNG
8. Save as `mustache.png`
9. Replace in `assets/` folder

## After Converting

### Update the Code

Once you have PNG versions, update `app.js` line 77:

**Before:**
```javascript
{ key: 'mustache', src: './assets/mustache-black-mustache-png-clipart.jpg' },
```

**After:**
```javascript
{ key: 'mustache', src: './assets/mustache.png' },
```

### Or Simply Rename

Alternatively, just save your new transparent PNG with the same filename:
- Save as `mustache-black-mustache-png-clipart.png` (change extension from .jpg to .png)
- The code will automatically use the new file

## Checking Your Images

### How to Tell if an Image Has Transparency:

1. **Open in browser**: Drag image to browser tab
   - Transparent areas show as checkered pattern
   - Or show the browser's background color

2. **Check file extension**:
   - `.png` or `.webp` = Can have transparency
   - `.jpg` or `.jpeg` = Never has transparency

3. **Check file properties**:
   - Right-click → Properties
   - Look at file type

## Tips for Best Results

### When Removing Background:

1. **High Contrast**: Images with clear edges work best
2. **Good Lighting**: Even lighting makes selection easier
3. **Simple Background**: Solid colors are easiest to remove
4. **High Resolution**: Start with largest image possible

### For Mustache:
- Remove all white/colored background
- Keep only the mustache itself
- Smooth the edges (feather 1-2 pixels)
- Save as PNG with transparency

### For Glasses:
- Remove background between lenses
- Keep frame and lenses
- Ensure transparency in empty areas
- Save as PNG

### For Hat:
- Remove all background
- Keep only the hat
- Include any decorations
- Save as PNG or WEBP

## Current Status

Your images:
- ❌ **Mustache**: JPG (needs conversion to PNG)
- ✅ **Glasses**: PNG (should work if background is transparent)
- ✅ **Hat**: WEBP (should work if background is transparent)

## Quick Fix Checklist

- [ ] Convert mustache JPG to PNG with transparent background
- [ ] Verify glasses PNG has transparent background
- [ ] Verify hat WEBP has transparent background
- [ ] Replace files in `assets/` folder
- [ ] Update code if filenames changed
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Test overlays on camera feed

## Recommended Filenames

For simplicity, use these names:
- `mustache.png` (transparent PNG)
- `glasses.png` (transparent PNG)
- `hat.png` (transparent PNG)

Then update `app.js` lines 77-79:
```javascript
const imagesToLoad = [
    { key: 'mustache', src: './assets/mustache.png' },
    { key: 'glasses', src: './assets/glasses.png' },
    { key: 'hat', src: './assets/hat.png' }
];
```

## Testing Transparency

After converting, test in browser:
1. Drag PNG file to browser tab
2. You should see:
   - Checkered pattern behind image (Chrome/Firefox)
   - Or browser background showing through
3. If you see white/colored background → Not transparent!

## Need Help?

If you're having trouble:
1. Share the image files
2. Use remove.bg (easiest option)
3. Or use Photopea (free online editor)
4. Make sure to export as PNG, not JPG

---

**Bottom Line**: Convert your mustache JPG to PNG with transparent background using remove.bg or Photopea, then replace the file in the assets folder!
