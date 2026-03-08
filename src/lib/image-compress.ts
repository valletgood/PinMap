/**
 * 클라이언트 이미지 압축 (배포 환경 413 Payload Too Large 방지)
 * Vercel 서버리스 요청 본문 한도(~4.5MB) 이내로 유지하기 위해 업로드 전 호출
 */

const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.82;
const TARGET_MAX_BYTES = 800 * 1024; // 800KB per file

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이미지 로드 실패"));
    };
    img.src = url;
  });
}

function drawToCanvas(
  img: HTMLImageElement,
  maxDim: number
): { canvas: HTMLCanvasElement; width: number; height: number } {
  let { width, height } = img;
  if (width <= maxDim && height <= maxDim) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2d not available");
    ctx.drawImage(img, 0, 0);
    return { canvas, width, height };
  }
  if (width > height) {
    height = Math.round((height * maxDim) / width);
    width = maxDim;
  } else {
    width = Math.round((width * maxDim) / height);
    height = maxDim;
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2d not available");
  ctx.drawImage(img, 0, 0, width, height);
  return { canvas, width, height };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob 실패"))),
      mime,
      quality
    );
  });
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

function isImageType(type: string): boolean {
  return IMAGE_TYPES.includes(type);
}

/**
 * 단일 이미지 파일을 리사이즈·압축하여 새 File 반환.
 * 이미 작으면 그대로 반환.
 */
async function compressOne(file: File): Promise<File> {
  if (!isImageType(file.type || "")) return file;
  if (file.size <= TARGET_MAX_BYTES) return file;

  const img = await loadImage(file);
  const { canvas } = drawToCanvas(img, MAX_DIMENSION);
  const mime = "image/jpeg";
  let quality = JPEG_QUALITY;
  let blob = await canvasToBlob(canvas, mime, quality);

  while (blob.size > TARGET_MAX_BYTES && quality > 0.2) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, mime, quality);
  }

  const name = file.name.replace(/\.[^.]+$/i, ".jpg");
  return new File([blob], name, { type: mime });
}

/**
 * 여러 이미지 파일을 압축하여 Vercel 페이로드 한도(4.5MB) 이하로 만듦.
 * 브라우저에서만 호출 (Canvas 사용).
 */
export async function compressImagesForUpload(files: File[]): Promise<File[]> {
  if (typeof window === "undefined" || !window.document) return files;
  return Promise.all(files.map(compressOne));
}
