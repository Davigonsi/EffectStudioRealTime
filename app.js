// DOM Elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const errorMessage = document.getElementById('error-message');
const status = document.getElementById('status');

// Control Elements
const filterButtons = document.querySelectorAll('.filter-btn');
const brightnessSlider = document.getElementById('brightness');
const contrastSlider = document.getElementById('contrast');
const saturationSlider = document.getElementById('saturation');
const blurSlider = document.getElementById('blur');
const hueRotateSlider = document.getElementById('hue-rotate');
const brightnessValue = document.getElementById('brightness-value');
const contrastValue = document.getElementById('contrast-value');
const saturationValue = document.getElementById('saturation-value');
const blurValue = document.getElementById('blur-value');
const hueRotateValue = document.getElementById('hue-rotate-value');
const takePhotoBtn = document.getElementById('btn-take-photo');
const resetBtn = document.getElementById('btn-reset');
const previewModal = document.getElementById('preview-modal');
const previewImage = document.getElementById('preview-image');
const downloadBtn = document.getElementById('btn-download');
const discardBtn = document.getElementById('btn-discard');

// Face Detection Elements
const faceCount = document.getElementById('face-count');
const faceCountNumber = document.getElementById('face-count-number');

// Face detection display settings (always on)
const showBoundingBox = { checked: false }; // Hide bounding box
const showLandmarks = { checked: false }; // Hide landmarks
const showConfidence = { checked: false }; // Hide confidence

// Face Overlay Elements
const overlayButtons = document.querySelectorAll('.overlay-btn');

// Effect State
let currentFilter = 'none';
let brightness = 100;
let contrast = 100;
let saturation = 100;
let blur = 0;
let hueRotate = 0;
let stream = null;
let animationId = null;
let capturedPhotoDataUrl = null;

// Face Detection State
let faceDetectionEnabled = true; // Auto-enabled when camera starts
let modelsLoaded = false;
let detections = [];

// Face Overlay State
let currentOverlay = 'none';
const overlayImages = {
    mustache: null,
    glasses: null,
    hat: null
};
let overlaysLoaded = false;

// Face Tracking State - for smooth tracking
let previousLandmarks = null;
let trackingHistory = [];
const TRACKING_SMOOTHING = 0.7; // Higher = smoother but more lag
const MAX_HISTORY = 3;

/**
 * Load overlay images
 */
function loadOverlayImages() {
    console.log('Starting to load overlay images...');
    
    const imagesToLoad = [
        { key: 'mustache', src: './assets/mustache.png' },
        { key: 'glasses', src: './assets/glasses.png' },
        { key: 'hat', src: './assets/hat.png' }
    ];
    
    let loadedCount = 0;
    let successCount = 0;
    
    imagesToLoad.forEach(({ key, src }) => {
        const img = new Image();
        img.onload = () => {
            overlayImages[key] = img;
            loadedCount++;
            successCount++;
            console.log(`✅ Loaded ${key} overlay (${img.width}x${img.height})`);
            if (loadedCount === imagesToLoad.length) {
                overlaysLoaded = true;
                console.log(`✅ All overlay images loaded successfully (${successCount}/${imagesToLoad.length})`);
                status.textContent = '✅ Overlays ready! Select one to try it out.';
                status.style.background = 'rgba(76, 175, 80, 0.3)';
            }
        };
        img.onerror = (error) => {
            console.error(`❌ Failed to load overlay: ${src}`, error);
            loadedCount++;
            if (loadedCount === imagesToLoad.length) {
                if (successCount > 0) {
                    overlaysLoaded = true;
                    console.log(`⚠️ Loaded ${successCount}/${imagesToLoad.length} overlays`);
                } else {
                    console.error('❌ No overlays loaded - check assets folder');
                }
            }
        };
        console.log(`Loading ${key} from ${src}...`);
        img.src = src;
    });
}

/**
 * Load face detection models
 */
async function loadFaceDetectionModels() {
    // Load overlay images
    loadOverlayImages();
    // Check if face-api is available
    if (typeof faceapi === 'undefined') {
        console.warn('face-api.js not loaded, skipping model loading');
        return;
    }
    
    try {
        status.textContent = '⏳ Loading face detection models...';
        status.style.background = 'rgba(255, 193, 7, 0.3)';
        
        // Load models from CDN
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
        
        modelsLoaded = true;
        console.log('Face detection models loaded successfully');
        
    } catch (error) {
        console.error('Error loading face detection models:', error);
        status.textContent = '⚠️ Face detection models failed to load';
        status.style.background = 'rgba(255, 152, 0, 0.3)';
    }
}

/**
 * Detect faces in the current video frame
 */
async function detectFaces() {
    if (!modelsLoaded || !faceDetectionEnabled) {
        detections = [];
        return;
    }
    
    try {
        // Detect faces with landmarks (always detect landmarks for overlays)
        const options = new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.5
        });
        
        // Always get landmarks if overlays are enabled or landmarks checkbox is checked
        if (showLandmarks.checked || currentOverlay !== 'none') {
            detections = await faceapi.detectAllFaces(video, options).withFaceLandmarks();
        } else {
            detections = await faceapi.detectAllFaces(video, options);
        }
        
        // Update face count
        if (detections.length > 0) {
            faceCountNumber.textContent = detections.length;
            faceCount.classList.remove('hidden');
        } else {
            faceCount.classList.add('hidden');
        }
        
    } catch (error) {
        console.error('Face detection error:', error);
        detections = [];
    }
}

/**
 * Draw face overlays (mustache, glasses, hat)
 */
function drawFaceOverlays() {
    // Enhanced debugging
    if (currentOverlay !== 'none' && Math.random() < 0.05) {
        console.log('🔍 drawFaceOverlays called:', {
            faceDetectionEnabled,
            currentOverlay,
            overlaysLoaded,
            detectionsLength: detections?.length || 0,
            mustacheImage: overlayImages.mustache ? 'loaded' : 'NOT LOADED',
            glassesImage: overlayImages.glasses ? 'loaded' : 'NOT LOADED',
            hatImage: overlayImages.hat ? 'loaded' : 'NOT LOADED'
        });
    }
    
    if (!faceDetectionEnabled || !detections || detections.length === 0) {
        // Show message if face detection is off but overlay is selected
        if (currentOverlay !== 'none') {
            ctx.fillStyle = 'rgba(255, 152, 0, 0.8)';
            ctx.fillRect(10, 10, 300, 40);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('⚠️ Enable face detection to see overlays', 20, 35);
            console.warn('⚠️ No detections available');
        }
        return;
    }
    
    if (currentOverlay === 'none') return;
    
    if (!overlaysLoaded) {
        // Show loading message
        ctx.fillStyle = 'rgba(255, 193, 7, 0.8)';
        ctx.fillRect(10, 10, 250, 40);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('⏳ Loading overlay images...', 20, 35);
        console.warn('⏳ Overlays not loaded yet');
        return;
    }
    
    detections.forEach(detection => {
        if (!detection || !detection.landmarks) {
            // Show message if landmarks not detected
            ctx.fillStyle = 'rgba(255, 152, 0, 0.8)';
            ctx.fillRect(10, 10, 350, 40);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('⚠️ Face detected but landmarks missing', 20, 35);
            return;
        }
        
        const landmarks = detection.landmarks.positions;
        
        // Draw mustache
        if (currentOverlay === 'mustache' || currentOverlay === 'all') {
            console.log('🎨 Attempting to draw mustache...');
            drawMustache(landmarks);
        }
        
        // Draw glasses
        if (currentOverlay === 'glasses' || currentOverlay === 'all') {
            console.log('🎨 Attempting to draw glasses...');
            drawGlasses(landmarks);
        }
        
        // Draw hat
        if (currentOverlay === 'hat' || currentOverlay === 'all') {
            console.log('🎨 Attempting to draw hat...');
            drawHat(landmarks);
        }
    });
    
    // Show active overlay indicator in corner
    ctx.save();
    ctx.fillStyle = 'rgba(102, 126, 234, 0.9)';
    ctx.fillRect(canvas.width - 180, 10, 170, 45);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`✨ ${currentOverlay.toUpperCase()} ACTIVE`, canvas.width - 170, 38);
    ctx.restore();
    
    // Debug indicator
    if (Math.random() < 0.1) {
        console.log('✅ Overlay drawing completed for:', currentOverlay);
    }
}

/**
 * Smooth landmark positions for stable tracking
 */
function smoothLandmarks(newLandmarks) {
    if (!previousLandmarks) {
        previousLandmarks = newLandmarks;
        return newLandmarks;
    }
    
    const smoothed = newLandmarks.map((point, index) => {
        const prev = previousLandmarks[index];
        return {
            x: prev.x * TRACKING_SMOOTHING + point.x * (1 - TRACKING_SMOOTHING),
            y: prev.y * TRACKING_SMOOTHING + point.y * (1 - TRACKING_SMOOTHING)
        };
    });
    
    previousLandmarks = smoothed;
    return smoothed;
}

/**
 * Draw mustache overlay with improved tracking
 */
function drawMustache(rawLandmarks) {
    if (!overlayImages.mustache) {
        console.warn('Mustache image not loaded');
        return;
    }
    
    try {
        // Smooth landmarks for stable tracking
        const landmarks = smoothLandmarks(rawLandmarks);
        
        // Get nose bottom point (landmark 33)
        const noseBottom = landmarks[33];
        if (!noseBottom) {
            console.warn('Nose landmark missing');
            return;
        }
        
        // Get mouth corners (landmarks 48 and 54)
        const mouthLeft = landmarks[48];
        const mouthRight = landmarks[54];
        
        if (!mouthLeft || !mouthRight) {
            console.warn('Mouth landmarks missing');
            return;
        }
        
        // Calculate mustache width based on mouth width
        const mouthWidth = Math.abs(mouthRight.x - mouthLeft.x);
        const mustacheWidth = mouthWidth * 1.8;  // Increased from 1.3 to 1.8
        const mustacheHeight = mustacheWidth * 0.5;  // Adjusted ratio from 0.4 to 0.5
        
        // Position mustache slightly above upper lip
        const x = noseBottom.x - mustacheWidth / 2;
        const y = noseBottom.y - mustacheHeight * 0.3;
        
        // Save context state
        ctx.save();
        
        // Enable smooth image rendering for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw overlay (transparency from PNG/WEBP will be preserved)
        ctx.drawImage(overlayImages.mustache, x, y, mustacheWidth, mustacheHeight);
        
        // Restore context
        ctx.restore();
        
        // Debug visualization
        if (Math.random() < 0.01) {
            console.log('Mustache drawn at:', { x, y, width: mustacheWidth, height: mustacheHeight });
        }
    } catch (error) {
        console.error('Error drawing mustache:', error);
    }
}

/**
 * Draw glasses overlay with improved tracking
 */
function drawGlasses(rawLandmarks) {
    if (!overlayImages.glasses) {
        console.warn('Glasses image not loaded');
        return;
    }
    
    try {
        // Use smoothed landmarks
        const landmarks = previousLandmarks || rawLandmarks;
        
        // Get eye positions (landmarks 36-41 for left eye, 42-47 for right eye)
        const leftEye = landmarks[36];
        const rightEye = landmarks[45];
        
        if (!leftEye || !rightEye) {
            console.warn('Eye landmarks missing');
            return;
        }
        
        // Calculate glasses width based on eye distance
        const eyeDistance = Math.abs(rightEye.x - leftEye.x);
        const glassesWidth = eyeDistance * 2.8;  // Increased from 2.2 to 2.8
        const glassesHeight = glassesWidth * 0.45;  // Adjusted ratio from 0.4 to 0.45
        
        // Center glasses between eyes
        const centerX = (leftEye.x + rightEye.x) / 2;
        const centerY = (leftEye.y + rightEye.y) / 2;
        
        const x = centerX - glassesWidth / 2;
        const y = centerY - glassesHeight / 2;
        
        // Save context state
        ctx.save();
        
        // Enable smooth image rendering for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw overlay (transparency from PNG/WEBP will be preserved)
        ctx.drawImage(overlayImages.glasses, x, y, glassesWidth, glassesHeight);
        
        // Restore context
        ctx.restore();
        
        // Debug visualization
        if (Math.random() < 0.01) {
            console.log('Glasses drawn at:', { x, y, width: glassesWidth, height: glassesHeight });
        }
    } catch (error) {
        console.error('Error drawing glasses:', error);
    }
}

/**
 * Draw hat overlay with improved tracking
 */
function drawHat(rawLandmarks) {
    if (!overlayImages.hat) {
        console.warn('Hat image not loaded');
        return;
    }
    
    try {
        // Use smoothed landmarks
        const landmarks = previousLandmarks || rawLandmarks;
        
        // Get forehead position (top of face)
        const foreheadLeft = landmarks[17];
        const foreheadRight = landmarks[26];
        const noseTop = landmarks[27];
        
        if (!foreheadLeft || !foreheadRight || !noseTop) {
            console.warn('Forehead landmarks missing');
            return;
        }
        
        // Calculate hat width based on face width
        const faceWidth = Math.abs(foreheadRight.x - foreheadLeft.x);
        const hatWidth = faceWidth * 2.0;  // Increased from 1.5 to 2.0
        const hatHeight = hatWidth * 0.7;  // Adjusted ratio from 0.6 to 0.7
        
        // Position hat above forehead
        const centerX = (foreheadLeft.x + foreheadRight.x) / 2;
        const x = centerX - hatWidth / 2;
        const y = noseTop.y - hatHeight * 1.3;
        
        // Save context state
        ctx.save();
        
        // Enable smooth image rendering for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw overlay (transparency from PNG/WEBP will be preserved)
        ctx.drawImage(overlayImages.hat, x, y, hatWidth, hatHeight);
        
        // Restore context
        ctx.restore();
        
        // Debug visualization
        if (Math.random() < 0.01) {
            console.log('Hat drawn at:', { x, y, width: hatWidth, height: hatHeight });
        }
    } catch (error) {
        console.error('Error drawing hat:', error);
    }
}

/**
 * Draw face detection results on canvas
 */
function drawFaceDetections() {
    if (!faceDetectionEnabled || !detections || detections.length === 0) return;
    
    detections.forEach(detection => {
        if (!detection) return; // Skip null/undefined detections
        
        // Handle both detection formats (with and without landmarks)
        const box = detection.detection ? detection.detection.box : detection.box;
        const score = detection.detection ? detection.detection.score : detection.score;
        
        if (!box || !score) return; // Skip if no box or score data
        
        // Draw bounding box
        if (showBoundingBox.checked) {
            // Draw shadow for better visibility
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.lineWidth = 5;
            ctx.strokeRect(box.x + 2, box.y + 2, box.width, box.height);
            
            // Draw bright green box
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 4;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
            
            // Draw confidence score
            if (showConfidence.checked) {
                const confidence = `${(score * 100).toFixed(1)}%`;
                
                // Background for text
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(box.x, box.y - 30, 100, 25);
                
                // Text
                ctx.fillStyle = '#00ff00';
                ctx.font = 'bold 18px Arial';
                ctx.fillText(confidence, box.x + 5, box.y - 10);
            }
        }
        
        // Draw facial landmarks
        if (showLandmarks.checked && detection.landmarks) {
            const landmarks = detection.landmarks.positions;
            landmarks.forEach(point => {
                // Draw shadow
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.beginPath();
                ctx.arc(point.x + 1, point.y + 1, 3, 0, 2 * Math.PI);
                ctx.fill();
                
                // Draw bright red point
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
                ctx.fill();
            });
        }
    });
}

/**
 * Initialize the camera and start the application
 */
async function initCamera() {
    // Load face detection models first
    await loadFaceDetectionModels();
    try {
        // Request camera access with specific constraints
        const constraints = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            },
            audio: false
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Set the video source to the camera stream
        video.srcObject = stream;
        
        // Wait for video metadata to load
        video.addEventListener('loadedmetadata', () => {
            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Auto-enable face detection
            faceDetectionEnabled = true;
            
            // Update status
            status.textContent = '✅ Camera ready! Face detection active.';
            status.style.background = 'rgba(76, 175, 80, 0.3)';
            
            // Start rendering loop
            renderFrame();
        });

    } catch (error) {
        handleCameraError(error);
    }
}

/**
 * Handle camera access errors
 */
function handleCameraError(error) {
    console.error('Camera error:', error);
    
    let errorText = '';
    
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorText = '❌ Camera access denied. Please allow camera permissions and refresh the page.';
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorText = '❌ No camera found. Please connect a camera and refresh the page.';
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorText = '❌ Camera is already in use by another application. Please close other apps and refresh.';
    } else if (error.name === 'OverconstrainedError') {
        errorText = '❌ Camera does not meet the required specifications.';
    } else if (error.name === 'SecurityError') {
        errorText = '❌ Camera access blocked due to security restrictions. Please use HTTPS or localhost.';
    } else {
        errorText = `❌ Camera error: ${error.message}`;
    }
    
    // Display error message
    errorMessage.textContent = errorText;
    errorMessage.classList.remove('hidden');
    
    // Update status
    status.textContent = '❌ Camera initialization failed';
    status.style.background = 'rgba(244, 67, 54, 0.3)';
}

/**
 * Render each frame with applied effects
 */
async function renderFrame() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Build and apply filter string
        let filterString = '';
        if (brightness !== 100) filterString += `brightness(${brightness}%) `;
        if (contrast !== 100) filterString += `contrast(${contrast}%) `;
        if (saturation !== 100) filterString += `saturate(${saturation}%) `;
        if (blur > 0) filterString += `blur(${blur}px) `;
        if (hueRotate !== 0) filterString += `hue-rotate(${hueRotate}deg) `;
        
        switch (currentFilter) {
            case 'grayscale': filterString += 'grayscale(100%)'; break;
            case 'sepia': filterString += 'sepia(100%)'; break;
            case 'invert': filterString += 'invert(100%)'; break;
            case 'pixelated':
                // Pixelated effect requires special handling
                ctx.filter = filterString.trim() || 'none';
                ctx.imageSmoothingEnabled = false;
                const pixelSize = 10;
                const w = canvas.width / pixelSize;
                const h = canvas.height / pixelSize;
                ctx.drawImage(video, 0, 0, w, h);
                ctx.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
                ctx.imageSmoothingEnabled = true;
                break;
        }
        
        if (currentFilter !== 'pixelated') {
            ctx.filter = filterString.trim() || 'none';
            // Draw the video frame with filters applied
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        
        // CRITICAL: Save the canvas state before face detection
        ctx.save();
        
        // Reset filter for overlays
        ctx.filter = 'none';
        ctx.globalCompositeOperation = 'source-over';
        
        // Detect and draw faces ON TOP of effects
        if (faceDetectionEnabled) {
            await detectFaces();
            
            // Debug: Log overlay state every 2 seconds for troubleshooting
            if (Math.random() < 0.008) {
                console.log('🎭 OVERLAY DEBUG:', {
                    faceDetectionEnabled,
                    currentOverlay,
                    overlaysLoaded,
                    detectionsCount: detections.length,
                    hasLandmarks: detections[0]?.landmarks ? 'YES ✅' : 'NO ❌',
                    glassesImageLoaded: overlayImages.glasses ? 'YES ✅' : 'NO ❌',
                    mustacheImageLoaded: overlayImages.mustache ? 'YES ✅' : 'NO ❌',
                    hatImageLoaded: overlayImages.hat ? 'YES ✅' : 'NO ❌'
                });
                
                if (currentOverlay !== 'none' && overlaysLoaded && detections.length > 0) {
                    console.log('✨ Overlays SHOULD be visible on screen right now!');
                }
            }
            
            drawFaceOverlays(); // Draw overlays on top
            drawFaceDetections(); // Then draw detection boxes
            
            // Restore canvas state
            ctx.restore();
        }
    }
    
    // Continue the animation loop
    animationId = requestAnimationFrame(renderFrame);
}

/**
 * Apply all selected effects to the canvas
 */
function applyEffects() {
    // Build CSS filter string
    let filterString = '';
    
    // Add brightness
    if (brightness !== 100) {
        filterString += `brightness(${brightness}%) `;
    }
    
    // Add contrast
    if (contrast !== 100) {
        filterString += `contrast(${contrast}%) `;
    }
    
    // Add saturation
    if (saturation !== 100) {
        filterString += `saturate(${saturation}%) `;
    }
    
    // Add blur
    if (blur > 0) {
        filterString += `blur(${blur}px) `;
    }
    
    // Add hue-rotate
    if (hueRotate !== 0) {
        filterString += `hue-rotate(${hueRotate}deg) `;
    }
    
    // Add selected filter effect
    switch (currentFilter) {
        case 'grayscale':
            filterString += 'grayscale(100%)';
            break;
        case 'sepia':
            filterString += 'sepia(100%)';
            break;
        case 'invert':
            filterString += 'invert(100%)';
            break;
        case 'none':
        default:
            // No additional filter
            break;
    }
    
    // Apply the filter to the canvas
    ctx.filter = filterString.trim() || 'none';
    
    // Redraw with filters applied
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
}

/**
 * Apply grayscale effect
 */
function applyGrayscale() {
    currentFilter = 'grayscale';
    updateActiveButton('btn-grayscale');
}

/**
 * Apply sepia effect
 */
function applySepia() {
    currentFilter = 'sepia';
    updateActiveButton('btn-sepia');
}

/**
 * Apply invert effect
 */
function applyInvert() {
    currentFilter = 'invert';
    updateActiveButton('btn-invert');
}

/**
 * Apply pixelated effect
 */
function applyPixelated() {
    currentFilter = 'pixelated';
    updateActiveButton('btn-pixelated');
}

/**
 * Remove all filter effects
 */
function removeFilters() {
    currentFilter = 'none';
    updateActiveButton('btn-none');
}

/**
 * Update brightness value
 */
function updateBrightness(value) {
    brightness = parseInt(value);
    brightnessValue.textContent = `${brightness}%`;
}

/**
 * Update contrast value
 */
function updateContrast(value) {
    contrast = parseInt(value);
    contrastValue.textContent = `${contrast}%`;
}

/**
 * Update saturation value
 */
function updateSaturation(value) {
    saturation = parseInt(value);
    saturationValue.textContent = `${saturation}%`;
}

/**
 * Update blur value
 */
function updateBlur(value) {
    blur = parseInt(value);
    blurValue.textContent = `${blur}px`;
}

/**
 * Update hue-rotate value
 */
function updateHueRotate(value) {
    hueRotate = parseInt(value);
    hueRotateValue.textContent = `${hueRotate}°`;
}

/**
 * Update active button state
 */
function updateActiveButton(activeId) {
    filterButtons.forEach(btn => {
        if (btn.id === activeId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

/**
 * Take a photo and show preview
 */
function takePhoto() {
    // Create a temporary canvas to capture the current frame with effects
    const photoCanvas = document.createElement('canvas');
    photoCanvas.width = canvas.width;
    photoCanvas.height = canvas.height;
    const photoCtx = photoCanvas.getContext('2d');
    
    // Apply the same filter
    let filterString = '';
    
    if (brightness !== 100) {
        filterString += `brightness(${brightness}%) `;
    }
    
    if (contrast !== 100) {
        filterString += `contrast(${contrast}%) `;
    }
    
    if (saturation !== 100) {
        filterString += `saturate(${saturation}%) `;
    }
    
    if (blur > 0) {
        filterString += `blur(${blur}px) `;
    }
    
    if (hueRotate !== 0) {
        filterString += `hue-rotate(${hueRotate}deg) `;
    }
    
    switch (currentFilter) {
        case 'grayscale':
            filterString += 'grayscale(100%)';
            break;
        case 'sepia':
            filterString += 'sepia(100%)';
            break;
        case 'invert':
            filterString += 'invert(100%)';
            break;
        case 'pixelated':
            // Apply pixelated effect to photo
            photoCtx.filter = filterString.trim() || 'none';
            photoCtx.imageSmoothingEnabled = false;
            const pixelSize = 10;
            const w = photoCanvas.width / pixelSize;
            const h = photoCanvas.height / pixelSize;
            photoCtx.drawImage(video, 0, 0, w, h);
            photoCtx.drawImage(photoCanvas, 0, 0, w, h, 0, 0, photoCanvas.width, photoCanvas.height);
            photoCtx.imageSmoothingEnabled = true;
            break;
    }
    
    if (currentFilter !== 'pixelated') {
        photoCtx.filter = filterString.trim() || 'none';
        photoCtx.drawImage(video, 0, 0, photoCanvas.width, photoCanvas.height);
    }
    
    // Draw face overlays on the photo if enabled
    if (faceDetectionEnabled && detections && detections.length > 0) {
        // Draw overlays first
        detections.forEach(detection => {
            if (!detection || !detection.landmarks) return;
            
            const landmarks = detection.landmarks.positions;
            
            // Draw mustache
            if (currentOverlay === 'mustache' || currentOverlay === 'all') {
                if (overlayImages.mustache) {
                    const noseBottom = landmarks[33];
                    const mouthLeft = landmarks[48];
                    const mouthRight = landmarks[54];
                    const mouthWidth = Math.abs(mouthRight.x - mouthLeft.x);
                    const mustacheWidth = mouthWidth * 1.3;
                    const mustacheHeight = mustacheWidth * 0.4;
                    const x = noseBottom.x - mustacheWidth / 2;
                    const y = noseBottom.y - mustacheHeight * 0.3;
                    photoCtx.drawImage(overlayImages.mustache, x, y, mustacheWidth, mustacheHeight);
                }
            }
            
            // Draw glasses
            if (currentOverlay === 'glasses' || currentOverlay === 'all') {
                if (overlayImages.glasses) {
                    const leftEye = landmarks[36];
                    const rightEye = landmarks[45];
                    const eyeDistance = Math.abs(rightEye.x - leftEye.x);
                    const glassesWidth = eyeDistance * 2.2;
                    const glassesHeight = glassesWidth * 0.4;
                    const centerX = (leftEye.x + rightEye.x) / 2;
                    const centerY = (leftEye.y + rightEye.y) / 2;
                    const x = centerX - glassesWidth / 2;
                    const y = centerY - glassesHeight / 2;
                    photoCtx.drawImage(overlayImages.glasses, x, y, glassesWidth, glassesHeight);
                }
            }
            
            // Draw hat
            if (currentOverlay === 'hat' || currentOverlay === 'all') {
                if (overlayImages.hat) {
                    const foreheadLeft = landmarks[17];
                    const foreheadRight = landmarks[26];
                    const noseTop = landmarks[27];
                    const faceWidth = Math.abs(foreheadRight.x - foreheadLeft.x);
                    const hatWidth = faceWidth * 1.5;
                    const hatHeight = hatWidth * 0.6;
                    const centerX = (foreheadLeft.x + foreheadRight.x) / 2;
                    const x = centerX - hatWidth / 2;
                    const y = noseTop.y - hatHeight * 1.3;
                    photoCtx.drawImage(overlayImages.hat, x, y, hatWidth, hatHeight);
                }
            }
        });
    }
    
    // Draw face detections on the photo if enabled
    if (faceDetectionEnabled && detections && detections.length > 0) {
        detections.forEach(detection => {
            if (!detection) return; // Skip null/undefined detections
            
            // Handle both detection formats (with and without landmarks)
            const box = detection.detection ? detection.detection.box : detection.box;
            const score = detection.detection ? detection.detection.score : detection.score;
            
            if (!box || !score) return; // Skip if no box or score data
            
            // Draw bounding box
            if (showBoundingBox.checked) {
                photoCtx.strokeStyle = '#00ff00';
                photoCtx.lineWidth = 3;
                photoCtx.strokeRect(box.x, box.y, box.width, box.height);
                
                // Draw confidence score
                if (showConfidence.checked) {
                    const confidence = `${(score * 100).toFixed(1)}%`;
                    photoCtx.fillStyle = '#00ff00';
                    photoCtx.font = 'bold 16px Arial';
                    photoCtx.fillText(confidence, box.x, box.y - 5);
                }
            }
            
            // Draw facial landmarks
            if (showLandmarks.checked && detection.landmarks) {
                const landmarks = detection.landmarks.positions;
                photoCtx.fillStyle = '#ff0000';
                landmarks.forEach(point => {
                    photoCtx.beginPath();
                    photoCtx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
                    photoCtx.fill();
                });
            }
        });
    }
    
    // Convert canvas to data URL and show preview
    capturedPhotoDataUrl = photoCanvas.toDataURL('image/png');
    previewImage.src = capturedPhotoDataUrl;
    
    // Show the modal
    previewModal.classList.remove('hidden');
    
    // Visual feedback on canvas
    canvas.style.transform = 'scale(0.95)';
    setTimeout(() => {
        canvas.style.transform = 'scale(1)';
    }, 200);
}

/**
 * Download the captured photo
 */
function downloadPhoto() {
    if (!capturedPhotoDataUrl) return;
    
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `photo-effect-${timestamp}.png`;
    link.href = capturedPhotoDataUrl;
    link.click();
    
    // Close modal
    closePreviewModal();
    
    // Update status temporarily
    status.textContent = '✅ Photo downloaded!';
    status.style.background = 'rgba(76, 175, 80, 0.3)';
    setTimeout(() => {
        status.textContent = '✅ Camera ready! Apply effects and take photos.';
    }, 2000);
}

/**
 * Discard the captured photo
 */
function discardPhoto() {
    closePreviewModal();
    
    // Update status temporarily
    status.textContent = '🗑️ Photo discarded';
    status.style.background = 'rgba(244, 67, 54, 0.3)';
    setTimeout(() => {
        status.textContent = '✅ Camera ready! Apply effects and take photos.';
        status.style.background = 'rgba(76, 175, 80, 0.3)';
    }, 2000);
}

/**
 * Close the preview modal
 */
function closePreviewModal() {
    previewModal.classList.add('hidden');
    capturedPhotoDataUrl = null;
    previewImage.src = '';
}

/**
 * Reset all filters to default
 */
function resetFilters() {
    currentFilter = 'none';
    brightness = 100;
    contrast = 100;
    saturation = 100;
    blur = 0;
    hueRotate = 0;
    
    brightnessSlider.value = 100;
    contrastSlider.value = 100;
    saturationSlider.value = 100;
    blurSlider.value = 0;
    hueRotateSlider.value = 0;
    brightnessValue.textContent = '100%';
    contrastValue.textContent = '100%';
    saturationValue.textContent = '100%';
    blurValue.textContent = '0px';
    hueRotateValue.textContent = '0°';
    
    updateActiveButton('btn-none');
}

/**
 * Event Listeners
 */

// Filter button clicks
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        switch (filter) {
            case 'grayscale':
                applyGrayscale();
                break;
            case 'sepia':
                applySepia();
                break;
            case 'invert':
                applyInvert();
                break;
            case 'pixelated':
                applyPixelated();
                break;
            case 'none':
                removeFilters();
                break;
        }
    });
});

// Slider inputs
brightnessSlider.addEventListener('input', (e) => {
    updateBrightness(e.target.value);
});

contrastSlider.addEventListener('input', (e) => {
    updateContrast(e.target.value);
});

saturationSlider.addEventListener('input', (e) => {
    updateSaturation(e.target.value);
});

blurSlider.addEventListener('input', (e) => {
    updateBlur(e.target.value);
});

hueRotateSlider.addEventListener('input', (e) => {
    updateHueRotate(e.target.value);
});

// Action buttons
takePhotoBtn.addEventListener('click', takePhoto);
resetBtn.addEventListener('click', resetFilters);

// Modal buttons
downloadBtn.addEventListener('click', downloadPhoto);
discardBtn.addEventListener('click', discardPhoto);

// Close modal on background click
previewModal.addEventListener('click', (e) => {
    if (e.target === previewModal) {
        discardPhoto();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !previewModal.classList.contains('hidden')) {
        discardPhoto();
    }
});

// Face detection is now always enabled when camera is active
// No toggle needed

// Overlay Button Clicks
overlayButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const overlay = btn.dataset.overlay;
        
        // Face detection is always enabled, no need to check
        
        // Check if overlays are loaded
        if (!overlaysLoaded && overlay !== 'none') {
            status.textContent = '⏳ Loading overlay images...';
            status.style.background = 'rgba(255, 193, 7, 0.3)';
            setTimeout(() => {
                status.textContent = '✅ Camera ready! Apply effects and take photos.';
                status.style.background = 'rgba(76, 175, 80, 0.3)';
            }, 2000);
            return;
        }
        
        currentOverlay = overlay;
        updateActiveOverlay(overlay);
        
        // Update status message
        if (overlay === 'none') {
            status.textContent = '✅ Overlay removed';
        } else {
            status.textContent = `✨ ${overlay.charAt(0).toUpperCase() + overlay.slice(1)} overlay active - move your head!`;
        }
        status.style.background = 'rgba(76, 175, 80, 0.3)';
        
        // Log for debugging
        console.log(`Overlay changed to: ${overlay}`);
        console.log(`Overlays loaded: ${overlaysLoaded}`);
        console.log(`Face detection enabled: ${faceDetectionEnabled}`);
        console.log(`Current detections: ${detections.length}`);
    });
});

/**
 * Update active overlay button
 */
function updateActiveOverlay(activeOverlay) {
    overlayButtons.forEach(btn => {
        if (btn.dataset.overlay === activeOverlay) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});

// Add smooth transition to canvas
canvas.style.transition = 'transform 0.2s ease';

// Initialize the application when face-api is ready
if (typeof faceapi !== 'undefined') {
    initCamera();
} else {
    // Wait for face-api to load
    window.addEventListener('load', () => {
        if (typeof faceapi !== 'undefined') {
            initCamera();
        } else {
            console.error('face-api.js failed to load');
            status.textContent = '⚠️ Face detection library failed to load';
            status.style.background = 'rgba(255, 152, 0, 0.3)';
            // Initialize camera anyway without face detection
            initCamera();
        }
    });
}
