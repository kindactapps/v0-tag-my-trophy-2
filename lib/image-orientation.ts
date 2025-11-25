/**
 * Image Orientation Utilities for iOS Compatibility
 * Handles EXIF orientation data to ensure photos display correctly across all browsers
 */

export interface ImageDimensions {
  width: number
  height: number
}

export interface OrientationResult {
  canvas: HTMLCanvasElement
  correctedDimensions: ImageDimensions
  wasRotated: boolean
}

/**
 * Reads EXIF orientation data from image file
 */
export function getImageOrientation(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer
      if (!arrayBuffer) {
        resolve(1) // Default orientation
        return
      }

      const dataView = new DataView(arrayBuffer)

      // Check for JPEG signature
      if (dataView.getUint16(0) !== 0xffd8) {
        resolve(1)
        return
      }

      let offset = 2
      let marker = dataView.getUint16(offset)

      while (marker !== 0xffe1 && offset < dataView.byteLength) {
        offset += 2 + dataView.getUint16(offset + 2)
        if (offset >= dataView.byteLength) break
        marker = dataView.getUint16(offset)
      }

      if (marker !== 0xffe1) {
        resolve(1)
        return
      }

      // Check for Exif header
      offset += 4
      if (dataView.getUint32(offset) !== 0x45786966) {
        resolve(1)
        return
      }

      offset += 6
      const little = dataView.getUint16(offset) === 0x4949
      offset += dataView.getUint32(offset + 4, little)
      const tags = dataView.getUint16(offset, little)
      offset += 2

      for (let i = 0; i < tags; i++) {
        const tag = dataView.getUint16(offset + i * 12, little)
        if (tag === 0x0112) {
          // Orientation tag
          const orientation = dataView.getUint16(offset + i * 12 + 8, little)
          resolve(orientation)
          return
        }
      }

      resolve(1)
    }

    reader.onerror = () => resolve(1)
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024)) // Read first 64KB
  })
}

/**
 * Corrects image orientation based on EXIF data
 */
export function correctImageOrientation(
  image: HTMLImageElement,
  orientation: number,
  maxWidth?: number,
  maxHeight?: number,
): OrientationResult {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("Canvas context not available")
  }

  let { width, height } = image

  // Apply max dimensions if specified
  if (maxWidth && width > maxWidth) {
    height = (height * maxWidth) / width
    width = maxWidth
  }

  if (maxHeight && height > maxHeight) {
    width = (width * maxHeight) / height
    height = maxHeight
  }

  let wasRotated = false

  // Set canvas dimensions based on orientation
  switch (orientation) {
    case 5:
    case 6:
    case 7:
    case 8:
      canvas.width = height
      canvas.height = width
      wasRotated = true
      break
    default:
      canvas.width = width
      canvas.height = height
      break
  }

  // Apply transformations based on orientation
  switch (orientation) {
    case 2:
      ctx.transform(-1, 0, 0, 1, width, 0)
      break
    case 3:
      ctx.transform(-1, 0, 0, -1, width, height)
      break
    case 4:
      ctx.transform(1, 0, 0, -1, 0, height)
      break
    case 5:
      ctx.transform(0, 1, 1, 0, 0, 0)
      break
    case 6:
      ctx.transform(0, 1, -1, 0, height, 0)
      break
    case 7:
      ctx.transform(0, -1, -1, 0, height, width)
      break
    case 8:
      ctx.transform(0, -1, 1, 0, 0, width)
      break
    default:
      // No transformation needed
      break
  }

  // Draw the image with correct orientation
  ctx.drawImage(image, 0, 0, width, height)

  return {
    canvas,
    correctedDimensions: {
      width: canvas.width,
      height: canvas.height,
    },
    wasRotated,
  }
}

/**
 * Processes an image file to correct orientation issues
 */
export function processImageFile(
  file: File,
  maxWidth?: number,
  maxHeight?: number,
  quality = 0.9,
): Promise<{ blob: Blob; wasProcessed: boolean; dimensions: ImageDimensions }> {
  return new Promise((resolve, reject) => {
    // Skip processing for non-JPEG files or if not on iOS/Safari
    const isJPEG =
      file.type === "image/jpeg" ||
      file.name.toLowerCase().endsWith(".jpg") ||
      file.name.toLowerCase().endsWith(".jpeg")
    const isHEIC = file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

    if (!isJPEG && !isHEIC) {
      // For non-JPEG files, just return the original
      resolve({
        blob: file,
        wasProcessed: false,
        dimensions: { width: 0, height: 0 },
      })
      return
    }

    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = async () => {
      try {
        let orientation = 1

        // Only check orientation for JPEG files
        if (isJPEG) {
          orientation = await getImageOrientation(file)
        }

        // If orientation is 1 (normal) and no resizing needed, return original
        if (orientation === 1 && (!maxWidth || img.width <= maxWidth) && (!maxHeight || img.height <= maxHeight)) {
          resolve({
            blob: file,
            wasProcessed: false,
            dimensions: { width: img.width, height: img.height },
          })
          return
        }

        const result = correctImageOrientation(img, orientation, maxWidth, maxHeight)

        result.canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({
                blob,
                wasProcessed: true,
                dimensions: result.correctedDimensions,
              })
            } else {
              reject(new Error("Failed to create blob from canvas"))
            }
          },
          "image/jpeg",
          quality,
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error("Failed to load image"))
    }

    // Create object URL for the image
    const objectUrl = URL.createObjectURL(file)
    img.src = objectUrl

    // Clean up object URL after image loads
    img.onload = async () => {
      URL.revokeObjectURL(objectUrl)

      try {
        let orientation = 1

        if (isJPEG) {
          orientation = await getImageOrientation(file)
        }

        if (orientation === 1 && (!maxWidth || img.width <= maxWidth) && (!maxHeight || img.height <= maxHeight)) {
          resolve({
            blob: file,
            wasProcessed: false,
            dimensions: { width: img.width, height: img.height },
          })
          return
        }

        const result = correctImageOrientation(img, orientation, maxWidth, maxHeight)

        result.canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({
                blob,
                wasProcessed: true,
                dimensions: result.correctedDimensions,
              })
            } else {
              reject(new Error("Failed to create blob from canvas"))
            }
          },
          "image/jpeg",
          quality,
        )
      } catch (error) {
        reject(error)
      }
    }
  })
}

/**
 * Batch process multiple image files
 */
export async function processImageFiles(
  files: File[],
  maxWidth?: number,
  maxHeight?: number,
  quality = 0.9,
  onProgress?: (processed: number, total: number) => void,
): Promise<{ processedFiles: File[]; processedCount: number }> {
  const processedFiles: File[] = []
  let processedCount = 0

  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    try {
      if (file.type.startsWith("image/")) {
        const result = await processImageFile(file, maxWidth, maxHeight, quality)

        if (result.wasProcessed) {
          // Create a new File object from the processed blob
          const processedFile = new File([result.blob], file.name, {
            type: "image/jpeg",
            lastModified: file.lastModified,
          })
          processedFiles.push(processedFile)
          processedCount++
        } else {
          processedFiles.push(file)
        }
      } else {
        // Non-image files pass through unchanged
        processedFiles.push(file)
      }
    } catch (error) {
      console.error(`[v0] Failed to process image ${file.name}:`, error)
      // If processing fails, use original file
      processedFiles.push(file)
    }

    onProgress?.(i + 1, files.length)
  }

  return { processedFiles, processedCount }
}
