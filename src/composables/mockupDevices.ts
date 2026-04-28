export type DeviceCategory = 'phone' | 'laptop' | 'watch' | 'tv'

export type ScreenRect = { x: number; y: number; w: number; h: number }

export type DeviceConfig = {
  id: string
  name: string
  imageSrc: string
  screenRect: ScreenRect
  category: DeviceCategory
  orientation: 'portrait' | 'landscape'
  cornerRadius: number
}

export function screen(x: number, y: number, w: number, h: number): ScreenRect {
  return { x, y, w, h }
}

const BASE_URL = `${import.meta.env.BASE_URL}devices/`

export const devices: DeviceConfig[] = [
  {
    id: 'iphone-15-black-portrait',
    name: 'iPhone 15',
    imageSrc: `${BASE_URL}phones/apple-iphone-15-black-portrait.png`,
    screenRect: screen(90, 101, 1236, 2594),
    category: 'phone',
    orientation: 'portrait',
    cornerRadius: 130,
  },
  {
    id: 'iphone-11-black-portrait',
    name: 'iPhone 11',
    imageSrc: `${BASE_URL}phones/apple-iphone-11-black-portrait.png`,
    screenRect: screen(40, 44, 949, 1904),
    category: 'phone',
    orientation: 'portrait',
    cornerRadius: 80,
  },
  {
    id: 'iphone13-midnight-portrait',
    name: 'iPhone 13',
    imageSrc: `${BASE_URL}phones/apple-iphone13-midnight-portrait.png`,
    screenRect: screen(246, 254, 1078, 2425),
    category: 'phone',
    orientation: 'portrait',
    cornerRadius: 100,
  },
  {
    id: 'pixel8-rose-portrait',
    name: 'Pixel 8',
    imageSrc: `${BASE_URL}phones/google-pixel-8-rose-portrait.png`,
    screenRect: screen(20, 19, 943, 2063),
    category: 'phone',
    orientation: 'portrait',
    cornerRadius: 60,
  },
  {
    id: 'pixel5-justblack-portrait',
    name: 'Pixel 5',
    imageSrc: `${BASE_URL}phones/google-pixel5-justblack-portrait.png`,
    screenRect: screen(266, 266, 956, 2208),
    category: 'phone',
    orientation: 'portrait',
    cornerRadius: 60,
  },
  {
    id: 'galaxys21-black-portrait',
    name: 'Galaxy S21',
    imageSrc: `${BASE_URL}phones/samsung-galaxys21-black-portrait.png`,
    screenRect: screen(288, 290, 916, 2236),
    category: 'phone',
    orientation: 'portrait',
    cornerRadius: 50,
  },
  {
    id: 'macbookpro14-front',
    name: 'MacBook Pro 14"',
    imageSrc: `${BASE_URL}laptops/apple-macbookpro14-front.png`,
    screenRect: screen(85, 260, 3773, 2266),
    category: 'laptop',
    orientation: 'landscape',
    cornerRadius: 20,
  },
  {
    id: 'macbookpro16-front',
    name: 'MacBook Pro 16"',
    imageSrc: `${BASE_URL}laptops/apple-macbookpro16-front.png`,
    screenRect: screen(76, 273, 4188, 2545),
    category: 'laptop',
    orientation: 'landscape',
    cornerRadius: 20,
  },
  {
    id: 'xps13-front',
    name: 'XPS 13',
    imageSrc: `${BASE_URL}laptops/dell-xps13-front.png`,
    screenRect: screen(15, 439, 1970, 1121),
    category: 'laptop',
    orientation: 'landscape',
    cornerRadius: 0,
  },
  {
    id: 'xps15-front',
    name: 'XPS 15',
    imageSrc: `${BASE_URL}laptops/dell-xps15-front.png`,
    screenRect: screen(15, 510, 1970, 989),
    category: 'laptop',
    orientation: 'landscape',
    cornerRadius: 0,
  },
  {
    id: 'applewatch41mm',
    name: 'Apple Watch 41mm',
    imageSrc: `${BASE_URL}watches/apple-applewatch41mm-midnightaluminum-graysololoop-portrait.png`,
    screenRect: screen(44, 22, 410, 716),
    category: 'watch',
    orientation: 'portrait',
    cornerRadius: 30,
  },
  {
    id: 'watchseries5-40mm',
    name: 'Watch Series 5 40mm',
    imageSrc: `${BASE_URL}watches/apple-watch-series-5-40-mm-space-grey-aluminum-black-closed-portrait.png`,
    screenRect: screen(103, 132, 734, 1318),
    category: 'watch',
    orientation: 'portrait',
    cornerRadius: 80,
  },
  {
    id: 'galaxywatch4-black',
    name: 'Galaxy Watch 4',
    imageSrc: `${BASE_URL}watches/samsung-galaxy-watch-4-black-portrait.png`,
    screenRect: screen(466, 304, 552, 872),
    category: 'watch',
    orientation: 'portrait',
    cornerRadius: 80,
  },
  {
    id: 'lg55lw5600',
    name: 'LG 55"',
    imageSrc: `${BASE_URL}tvs/lg-55lw5600-front.png`,
    screenRect: screen(138, 220, 472, 276),
    category: 'tv',
    orientation: 'landscape',
    cornerRadius: 0,
  },
  {
    id: 'samsungd8000',
    name: 'Samsung 55"',
    imageSrc: `${BASE_URL}tvs/samsung-d8000-front.png`,
    screenRect: screen(206, 298, 318, 140),
    category: 'tv',
    orientation: 'landscape',
    cornerRadius: 0,
  },
]

export const devicesByCategory: Record<DeviceCategory, DeviceConfig[]> = {
  phone: devices.filter((d) => d.category === 'phone'),
  laptop: devices.filter((d) => d.category === 'laptop'),
  watch: devices.filter((d) => d.category === 'watch'),
  tv: devices.filter((d) => d.category === 'tv'),
}

export function getDeviceById(id: string): DeviceConfig | undefined {
  return devices.find((d) => d.id === id)
}