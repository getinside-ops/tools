/**
 * Image Metadata extraction logic
 * 100% client-side with comprehensive EXIF/IPTC/XMP/ICC support.
 */
import * as exifr from 'exifr'

export interface ImageMetadata {
  name: string
  size: number
  type: string
  lastModified: number
  width?: number
  height?: number
  // EXIF data
  exif?: ExifData
  // GPS data
  gps?: GpsData
  // IPTC data
  iptc?: IptcData
  // XMP data
  xmp?: Record<string, any>
  // ICC profile
  icc?: IccData
}

export interface ImageDimensions {
  width: number
  height: number
}

export interface ExifData {
  // Camera info
  make?: string
  model?: string
  lensModel?: string
  lensMake?: string
  bodySerialNumber?: string
  lensSerialNumber?: string
  // Capture settings
  exposureTime?: string
  fNumber?: string
  iso?: number
  focalLength?: string
  focalLengthIn35mm?: number
  exposureProgram?: string
  meteringMode?: string
  flash?: string
  whiteBalance?: string
  exposureBias?: string
  exposureMode?: string
  maxApertureValue?: string
  digitalZoomRatio?: number
  sceneCaptureType?: string
  // Date/time
  dateTimeOriginal?: Date
  dateTimeDigitized?: Date
  dateTime?: Date
  // Image properties
  orientation?: number
  xResolution?: number
  yResolution?: number
  resolutionUnit?: string
  colorSpace?: string
  // Software
  software?: string
  artist?: string
  copyright?: string
  // Other
  userComment?: string
  imageDescription?: string
}

export interface GpsData {
  latitude: number
  longitude: number
  altitude?: number
  latitudeRef?: string
  longitudeRef?: string
  altitudeRef?: string
  gpsTimestamp?: Date
  gpsDateStamp?: string
}

export interface IptcData {
  title?: string
  caption?: string
  keywords?: string[]
  creator?: string
  copyright?: string
  category?: string
  city?: string
  state?: string
  country?: string
  countryCode?: string
  dateCreated?: Date
  source?: string
  credit?: string
  writer?: string
  instructions?: string
  jobIdentifier?: string
}

export interface IccData {
  profileName?: string
  colorSpace?: string
  renderingIntent?: string
  manufacturer?: string
  model?: string
}

/**
 * Extracts basic file properties from a File object.
 */
export function extractBasicMetadata(file: File): ImageMetadata {
  return {
    name: file.name,
    size: file.size || 0,
    type: file.type,
    lastModified: file.lastModified
  }
}

/**
 * Extracts image dimensions from a File object by loading it into an Image element.
 * Returns null if the file is not an image or fails to load.
 */
export function extractDimensions(file: File): Promise<ImageDimensions | null> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(null)
      return
    }

    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      const dimensions = {
        width: img.naturalWidth,
        height: img.naturalHeight,
      }
      URL.revokeObjectURL(objectUrl)
      resolve(dimensions)
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(null)
    }

    img.src = objectUrl
  })
}

/**
 * Extracts comprehensive metadata from an image file using exifr.
 * Includes EXIF, IPTC, XMP, ICC, and GPS data.
 */
export async function extractComprehensiveMetadata(file: File): Promise<ImageMetadata> {
  const basicMetadata = extractBasicMetadata(file)

  // Extract dimensions
  const dims = await extractDimensions(file)
  if (dims) {
    basicMetadata.width = dims.width
    basicMetadata.height = dims.height
  }

  // Only extract rich metadata for supported formats
  if (!file.type.startsWith('image/')) {
    return basicMetadata
  }

  try {
    // Parse all available metadata
    const allTags = await exifr.parse(file, {
      tiff: true,       // EXIF/TIFF tags
      xmp: true,        // XMP metadata
      iptc: true,       // IPTC tags
      icc: true,        // ICC profile
      gps: true,        // GPS coordinates
      jfif: true,       // JFIF header
      ihdr: true,       // PNG IHDR chunk
    })

    if (!allTags) {
      return basicMetadata
    }

    // Extract GPS data
    const gpsData = await exifr.gps(file)
    if (gpsData) {
      basicMetadata.gps = {
        latitude: gpsData.latitude,
        longitude: gpsData.longitude,
        altitude: allTags.GPSAltitude,
        latitudeRef: allTags.GPSLatitudeRef,
        longitudeRef: allTags.GPSLongitudeRef,
        altitudeRef: allTags.GPSAltitudeRef,
        gpsTimestamp: allTags.GPSTimeStamp,
        gpsDateStamp: allTags.GPSDateStamp,
      }
    }

    // Extract EXIF data
    basicMetadata.exif = extractExifData(allTags)

    // Extract IPTC data
    if (allTags.iptc) {
      basicMetadata.iptc = {
        title: allTags.iptc.ObjectName || allTags.iptc.Title,
        caption: allTags.iptc.Caption || allTags.iptc.Abstract,
        keywords: allTags.iptc.Keyword,
        creator: allTags.iptc.ByLine || allTags.iptc.Creator,
        copyright: allTags.iptc.CopyrightNotice || allTags.iptc.Copyright,
        category: allTags.iptc.Category,
        city: allTags.iptc.City,
        state: allTags.iptc.ProvinceState || allTags.iptc.State,
        country: allTags.iptc.CountryName || allTags.iptc.Country,
        countryCode: allTags.iptc.CountryCode || allTags.iptc.Location,
        dateCreated: allTags.iptc.DateCreated,
        source: allTags.iptc.Source,
        credit: allTags.iptc.Credit || allTags.iptc.ByLineTitle,
        writer: allTags.iptc.WriterEditor,
        instructions: allTags.iptc.SpecialInstructions,
        jobIdentifier: allTags.iptc.TransmissionReference,
      }
    }

    // Extract XMP data
    if (allTags.xmp) {
      basicMetadata.xmp = allTags.xmp
    }

    // Extract ICC profile
    if (allTags.icc) {
      basicMetadata.icc = {
        profileName: allTags.icc.description,
        colorSpace: allTags.icc.colorSpace,
        renderingIntent: allTags.icc.renderingIntent,
        manufacturer: allTags.icc.manufacturer,
        model: allTags.icc.model,
      }
    }

    return basicMetadata
  } catch (error) {
    console.warn('Failed to extract comprehensive metadata:', error)
    return basicMetadata
  }
}

/**
 * Helper function to extract and format EXIF data from all tags.
 */
function extractExifData(allTags: any): ExifData {
  const exif: ExifData = {}

  // Camera info
  exif.make = allTags.Make
  exif.model = allTags.Model
  exif.lensModel = allTags.LensModel
  exif.lensMake = allTags.LensMake
  exif.bodySerialNumber = allTags.BodySerialNumber
  exif.lensSerialNumber = allTags.LensSerialNumber

  // Capture settings
  if (allTags.ExposureTime) {
    exif.exposureTime = formatExposureTime(allTags.ExposureTime)
  }
  if (allTags.FNumber) {
    exif.fNumber = `f/${allTags.FNumber}`
  }
  exif.iso = allTags.ISO || allTags.ISOSpeedRatings
  if (allTags.FocalLength) {
    exif.focalLength = `${allTags.FocalLength}mm`
  }
  exif.focalLengthIn35mm = allTags.FocalLengthIn35mmFilm || allTags.FocalLengthIn35mm
  exif.exposureProgram = formatExposureProgram(allTags.ExposureProgram)
  exif.meteringMode = formatMeteringMode(allTags.MeteringMode)
  exif.flash = formatFlash(allTags.Flash)
  exif.whiteBalance = formatWhiteBalance(allTags.WhiteBalance)
  if (allTags.ExposureBiasValue !== undefined) {
    exif.exposureBias = `${allTags.ExposureBiasValue > 0 ? '+' : ''}${allTags.ExposureBiasValue} EV`
  }
  exif.exposureMode = allTags.ExposureMode === 0 ? 'Auto' : allTags.ExposureMode === 1 ? 'Manual' : 'Auto Bracket'
  if (allTags.MaxApertureValue) {
    exif.maxApertureValue = `f/${Math.sqrt(Math.pow(2, allTags.MaxApertureValue)).toFixed(1)}`
  }
  exif.digitalZoomRatio = allTags.DigitalZoomRatio
  exif.sceneCaptureType = formatSceneCaptureType(allTags.SceneCaptureType)

  // Date/time
  exif.dateTimeOriginal = allTags.DateTimeOriginal
  exif.dateTimeDigitized = allTags.DateTimeDigitized
  exif.dateTime = allTags.ModifyDate || allTags.DateTime

  // Image properties
  exif.orientation = allTags.Orientation
  exif.xResolution = allTags.XResolution
  exif.yResolution = allTags.YResolution
  exif.resolutionUnit = allTags.ResolutionUnit === 2 ? 'inches' : allTags.ResolutionUnit === 3 ? 'cm' : undefined
  exif.colorSpace = allTags.ColorSpace === 1 ? 'sRGB' : allTags.ColorSpace === 65535 ? 'Uncalibrated' : `Other (${allTags.ColorSpace})`

  // Software
  exif.software = allTags.Software
  exif.artist = allTags.Artist
  exif.copyright = allTags.Copyright

  // Other
  exif.userComment = allTags.UserComment
  exif.imageDescription = allTags.ImageDescription

  return exif
}

/**
 * Format exposure time to fraction or decimal.
 */
function formatExposureTime(exposureTime: number): string {
  if (exposureTime >= 1) {
    return `${exposureTime}s`
  } else {
    const denominator = Math.round(1 / exposureTime)
    return `1/${denominator}s`
  }
}

/**
 * Format exposure program number to human-readable string.
 */
function formatExposureProgram(program?: number): string {
  const programs: Record<number, string> = {
    0: 'Not Defined',
    1: 'Manual',
    2: 'Normal Program',
    3: 'Aperture Priority',
    4: 'Shutter Priority',
    5: 'Creative Program',
    6: 'Action Program',
    7: 'Portrait Mode',
    8: 'Landscape Mode',
  }
  return program !== undefined ? programs[program] || `Unknown (${program})` : ''
}

/**
 * Format metering mode number to human-readable string.
 */
function formatMeteringMode(mode?: number): string {
  const modes: Record<number, string> = {
    0: 'Unknown',
    1: 'Average',
    2: 'Center-weighted Average',
    3: 'Spot',
    4: 'Multi-spot',
    5: 'Multi-segment',
    6: 'Partial',
  }
  return mode !== undefined ? modes[mode] || `Unknown (${mode})` : ''
}

/**
 * Format flash value to human-readable string.
 */
function formatFlash(flash?: number | { fired?: boolean; returned?: string }): string {
  if (typeof flash === 'number') {
    return flash & 1 ? 'Fired' : 'Did Not Fire'
  }
  if (typeof flash === 'object' && flash.fired !== undefined) {
    return flash.fired ? 'Fired' : 'Did Not Fire'
  }
  return ''
}

/**
 * Format white balance value to human-readable string.
 */
function formatWhiteBalance(whiteBalance?: number): string {
  const modes: Record<number, string> = {
    0: 'Auto',
    1: 'Manual',
  }
  return whiteBalance !== undefined ? modes[whiteBalance] || `Unknown (${whiteBalance})` : ''
}

/**
 * Format scene capture type to human-readable string.
 */
function formatSceneCaptureType(type?: number): string {
  const types: Record<number, string> = {
    0: 'Standard',
    1: 'Landscape',
    2: 'Portrait',
    3: 'Night Scene',
  }
  return type !== undefined ? types[type] || `Unknown (${type})` : ''
}
