/**
 * UI RENDERERS
 * Galeri ve renk paleti render fonksiyonları
 * SOLID: SRP - Sadece render işlemlerinden sorumlu
 */

import { DOM } from './dom-manager.js';
import { imageGallery } from '../state.js';
import { analyzeImageColors } from '../utils.js';

/**
 * Render image gallery
 * @returns {void}
 */
export function renderGallery() {
    DOM.imageGallery.innerHTML = '';

    imageGallery.images.forEach(imgData => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        if (imgData.src === imageGallery.currentImageSrc) {
            item.classList.add('active');
        }

        const img = document.createElement('img');
        img.src = imgData.src;
        item.appendChild(img);

        // Click to select
        item.addEventListener('click', () => {
            const event = new CustomEvent('gallery-image-selected', {
                detail: { src: imgData.src }
            });
            document.dispatchEvent(event);
        });

        // Remove button
        const removeBtn = document.createElement('div');
        removeBtn.className = 'gallery-remove';
        removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const event = new CustomEvent('gallery-image-removed', {
                detail: { id: imgData.id }
            });
            document.dispatchEvent(event);
        });
        item.appendChild(removeBtn);

        DOM.imageGallery.appendChild(item);
    });
}

/**
 * Render color palette UI
 * @param {Array<Object>} paletteColors - Array of color objects
 * @returns {void}
 */
export function renderColorPalette(paletteColors) {
    DOM.colorPalette.innerHTML = '';

    paletteColors.forEach(p => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = p.color;
        swatch.dataset.color = p.color;

        // Tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'color-tooltip';
        tooltip.innerText = p.label;
        swatch.appendChild(tooltip);

        // Click handler
        swatch.onclick = () => {
            const event = new CustomEvent('color-selected', {
                detail: { color: p.color }
            });
            document.dispatchEvent(event);
        };

        DOM.colorPalette.appendChild(swatch);
    });
}

/**
 * Analyze current image and update color palette
 * @param {Function} onComplete - Callback when analysis is complete (receives palette)
 * @returns {void}
 */
export function analyzeCurrentImage(onComplete) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageGallery.currentImageSrc;

    img.onload = () => {
        const palette = analyzeImageColors(img, DOM.analysisCanvas);
        renderColorPalette(palette);

        if (onComplete && palette.length > 0) {
            onComplete(palette);
        }
    };
}
