// frontend/lib/svg-utils.ts
import { IconCustomization } from '@/types/icon';

/**
 * Dynamically applies user customization (color, size, stroke-width, linecap, linejoin) to an SVG string.
 */
export function applyCustomizationToSvg(
  svgStr: string,
  custom: IconCustomization,
  style: 'outlined' | 'filled' = 'outlined'
): string {
  if (!svgStr) return '';

  let customized = svgStr;

  // Replace or inject width & height (using negative lookbehind so stroke-width is not matched)
  if (/(?<![a-zA-Z-])width=/.test(customized)) {
    customized = customized.replace(/(?<![a-zA-Z-])width="[^"]*"/g, `width="${custom.size}"`);
  } else {
    customized = customized.replace('<svg', `<svg width="${custom.size}"`);
  }

  if (/(?<![a-zA-Z-])height=/.test(customized)) {
    customized = customized.replace(/(?<![a-zA-Z-])height="[^"]*"/g, `height="${custom.size}"`);
  } else {
    customized = customized.replace('<svg', `<svg height="${custom.size}"`);
  }

  // Detect if this SVG is a stroke-based icon (has fill="none" or stroke="currentColor" without fill="currentColor")
  // vs a true solid-filled icon (has fill="currentColor" or solid fill without fill="none")
  const isStrokeBased = customized.includes('fill="none"') || (customized.includes('stroke="currentColor"') && !customized.includes('fill="currentColor"'));

  if (style === 'filled' && !isStrokeBased) {
    // For TRUE solid filled icons, set fill color
    if (customized.includes('fill="currentColor"')) {
      customized = customized.replace(/fill="currentColor"/g, `fill="${custom.color}"`);
    } else if (/(?<![a-zA-Z-])fill=/.test(customized)) {
      customized = customized.replace(/(?<![a-zA-Z-])fill="[^"]*"/g, `fill="${custom.color}"`);
    } else {
      customized = customized.replace('<svg', `<svg fill="${custom.color}"`);
    }
  } else {
    // For outlined icons OR stroke-based icons (which have no solid filled variant):
    // Set stroke color, stroke-width, stroke-linecap, stroke-linejoin, and keep fill="none"
    if (customized.includes('stroke="currentColor"')) {
      customized = customized.replace(/stroke="currentColor"/g, `stroke="${custom.color}"`);
    } else if (/(?<![a-zA-Z-])stroke=/.test(customized)) {
      customized = customized.replace(/(?<![a-zA-Z-])stroke="[^"]*"/g, `stroke="${custom.color}"`);
    } else {
      customized = customized.replace('<svg', `<svg stroke="${custom.color}"`);
    }

    if (customized.includes('stroke-width=')) {
      customized = customized.replace(/stroke-width="[^"]*"/g, `stroke-width="${custom.strokeWidth}"`);
    } else {
      customized = customized.replace('<svg', `<svg stroke-width="${custom.strokeWidth}"`);
    }

    if (customized.includes('stroke-linecap=')) {
      customized = customized.replace(/stroke-linecap="[^"]*"/g, `stroke-linecap="${custom.strokeLinecap}"`);
    } else {
      customized = customized.replace('<svg', `<svg stroke-linecap="${custom.strokeLinecap}"`);
    }

    if (customized.includes('stroke-linejoin=')) {
      customized = customized.replace(/stroke-linejoin="[^"]*"/g, `stroke-linejoin="${custom.strokeLinejoin}"`);
    } else {
      customized = customized.replace('<svg', `<svg stroke-linejoin="${custom.strokeLinejoin}"`);
    }
  }

  return customized;
}

/**
 * Converts an SVG string into clean, formatted React JSX component code.
 */
export function svgToJsx(svgStr: string, componentName = 'Icon'): string {
  if (!svgStr) return '';

  let jsx = svgStr
    .replace(/class=/g, 'className=')
    .replace(/stroke-width=/g, 'strokeWidth=')
    .replace(/stroke-linecap=/g, 'strokeLinecap=')
    .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
    .replace(/stroke-miterlimit=/g, 'strokeMiterlimit=')
    .replace(/fill-rule=/g, 'fillRule=')
    .replace(/clip-rule=/g, 'clipRule=')
    .replace(/clip-path=/g, 'clipPath=');

  return `import React from 'react';

export default function ${componentName}(props: React.SVGProps<SVGSVGElement>) {
  return (
    ${jsx.replace('<svg', '<svg {...props}')}
  );
}`;
}

/**
 * Downloads a customized SVG string as a .svg file.
 */
export function downloadSvg(svgContent: string, filename: string) {
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Renders an SVG string to a canvas at a given size and downloads it as a .png file.
 */
export function downloadPng(svgContent: string, filename: string, size = 512): Promise<void> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const img = new Image();
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);

      canvas.toBlob((pngBlob) => {
        if (!pngBlob) {
          reject(new Error('PNG export failed'));
          return;
        }
        const pngUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = filename.endsWith('.png') ? filename : `${filename}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(pngUrl);
        resolve();
      }, 'image/png');
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };

    img.src = url;
  });
}

/**
 * Copy text to clipboard with fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    document.body.removeChild(textArea);
    return false;
  }
}
