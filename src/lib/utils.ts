import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a HEX color string to an HSL string "H S% L%".
 * @param hex The HEX color string (e.g., "#RRGGBB" or "#RGB").
 * @returns The HSL string.
 */
export function hexToHslString(hex: string): string {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  } else {
    return "0 0% 0%"; // Invalid hex
  }

  r /= 255;
  g /= 255;
  b /= 255;

  const cmin = Math.min(r, g, b);
  const cmax = Math.max(r, g, b);
  const delta = cmax - cmin;
  let h = 0, s = 0, l = 0;

  if (delta === 0) {
    h = 0;
  } else if (cmax === r) {
    h = ((g - b) / delta) % 6;
  } else if (cmax === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return `${h} ${s}% ${l}%`;
}

/**
 * Converts an HSL string "H S% L%" to a HEX color string.
 * @param hslString The HSL string.
 * @returns The HEX color string (e.g., "#RRGGBB").
 */
export function hslStringToHex(hslString: string): string {
  try {
    const [hStr, sStr, lStr] = hslString.split(" ");
    const h = parseFloat(hStr);
    const s = parseFloat(sStr.replace('%', '')) / 100;
    const l = parseFloat(lStr.replace('%', '')) / 100;

    if (isNaN(h) || isNaN(s) || isNaN(l)) return "#000000";


    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

    const toHex = (val: number) => {
      const hex = Math.round(val * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;

  } catch (error) {
    console.error("Error converting HSL string to HEX:", error, "Input:", hslString);
    return "#000000"; // Fallback
  }
}
