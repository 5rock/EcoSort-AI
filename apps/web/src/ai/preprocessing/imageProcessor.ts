import * as ort from 'onnxruntime-web';

// Target size for MobileNetV2
const TARGET_WIDTH = 224;
const TARGET_HEIGHT = 224;

export async function processImage(imageSrc: string): Promise<ort.Tensor> {
    const response = await fetch(imageSrc);
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);

    const canvas = new OffscreenCanvas(TARGET_WIDTH, TARGET_HEIGHT);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get OffscreenCanvas context');

    // Center crop and resize
    const scale = Math.max(TARGET_WIDTH / bitmap.width, TARGET_HEIGHT / bitmap.height);
    const x = (TARGET_WIDTH / scale - bitmap.width) / 2;
    const y = (TARGET_HEIGHT / scale - bitmap.height) / 2;

    ctx.drawImage(bitmap, x, y, bitmap.width, bitmap.height, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);
    const imageData = ctx.getImageData(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

    // Phase 5: Scan Quality Check
    const brightness = calculateBrightness(imageData);
    const blurVariance = calculateBlur(imageData, TARGET_WIDTH, TARGET_HEIGHT);
    
    console.log(`Scan Quality -> Brightness: ${brightness.toFixed(2)}, Blur Variance: ${blurVariance.toFixed(2)}`);

    if (brightness < 30) throw new Error('QUALITY_ERROR: IMAGE_TOO_DARK');
    if (brightness > 240) throw new Error('QUALITY_ERROR: IMAGE_TOO_BRIGHT');
    if (blurVariance < 15) throw new Error('QUALITY_ERROR: IMAGE_TOO_BLURRY');

    const tensor = imageDataToTensor(imageData);
    return tensor;
}

function calculateBrightness(imageData: ImageData): number {
  const data = imageData.data;
  let sum = 0;
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i], g = data[i+1], b = data[i+2];
    sum += (0.299 * r + 0.587 * g + 0.114 * b);
  }
  return sum / (data.length / 16);
}

function calculateBlur(imageData: ImageData, width: number, height: number): number {
  const data = imageData.data;
  let sum = 0;
  let sqSum = 0;
  let count = 0;
  // Sample every other row/col for speed
  for (let y = 0; y < height; y += 2) {
    for (let x = 1; x < width; x += 2) {
      const i = (y * width + x) * 4;
      const pI = (y * width + (x - 1)) * 4;
      const l1 = 0.299*data[i] + 0.587*data[i+1] + 0.114*data[i+2];
      const l2 = 0.299*data[pI] + 0.587*data[pI+1] + 0.114*data[pI+2];
      const diff = l1 - l2;
      sum += diff;
      sqSum += diff * diff;
      count++;
    }
  }
  const mean = sum / count;
  return (sqSum / count) - (mean * mean);
}

function imageDataToTensor(image: ImageData): ort.Tensor {
  const { data, width, height } = image;
  const float32Data = new Float32Array(3 * width * height);

  // Normalize: MobileNetV2 uses mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4] / 255;
    const g = data[i * 4 + 1] / 255;
    const b = data[i * 4 + 2] / 255;

    // NCHW format
    float32Data[i] = (r - 0.485) / 0.229;
    float32Data[width * height + i] = (g - 0.456) / 0.224;
    float32Data[2 * width * height + i] = (b - 0.406) / 0.225;
  }

  return new ort.Tensor('float32', float32Data, [1, 3, height, width]);
}
