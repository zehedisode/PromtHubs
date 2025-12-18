/**
 * DRAG & DROP MODULE
 * Handles drag and drop events for image upload
 * PromtHubs Card Creator v5.4
 */

import { DOM } from '../ui.js';
import { handleFileUpload } from '../utils.js';
import { addImageToGallery, setCurrentImage } from '../state.js';
import { updateCanvasBackgrounds } from '../canvas-manager.js';
import { analyzeCurrentImage, updateUI } from '../ui.js';
import { Logger } from '../logger.js';
import { Toast } from '../toast.js';

/**
 * Handle image file uploads
 * @param {FileList|Array} files - Files to upload
 */
export function handleImageFiles(files) {
    handleFileUpload(files, (src) => {
        Logger.info('EVENTS', 'Image uploaded');
        addImageToGallery(src);
        handleImageSelected(src);
        Toast.success('Görsel başarıyla yüklendi');
    });
}

/**
 * Handle image selection from gallery
 * @param {string} src - Image source URL
 */
export function handleImageSelected(src) {
    setCurrentImage(src);
    updateCanvasBackgrounds(src);
    analyzeCurrentImage();
    updateUI();
}

/**
 * Handle drag over event for dropzone
 * @param {Event} e 
 */
export function handleDragOver(e) {
    e.preventDefault();
    DOM.dropZone.style.borderColor = "var(--brand-yellow)";
}

/**
 * Handle drag leave event for dropzone
 * @param {Event} e 
 */
export function handleDragLeave(e) {
    e.preventDefault();
    DOM.dropZone.style.borderColor = "var(--brand-border)";
}

/**
 * Handle file drop event
 * @param {Event} e 
 */
export function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    DOM.dropZone.style.borderColor = "var(--brand-border)";
    document.body.classList.remove('global-drag-active');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleImageFiles(e.dataTransfer.files);
    }
}

/**
 * Handle global drag over event (entire page)
 * @param {Event} e 
 */
export function handleGlobalDragOver(e) {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) {
        document.body.classList.add('global-drag-active');
    }
}

/**
 * Handle global drag leave event
 * @param {Event} e 
 */
export function handleGlobalDragLeave(e) {
    e.preventDefault();
    if (e.target === document.documentElement || !e.relatedTarget) {
        document.body.classList.remove('global-drag-active');
    }
}

/**
 * Handle global file drop event
 * @param {Event} e 
 */
export function handleGlobalDrop(e) {
    e.preventDefault();
    document.body.classList.remove('global-drag-active');

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const imageFiles = Array.from(e.dataTransfer.files).filter(
            file => file.type.startsWith('image/')
        );
        if (imageFiles.length > 0) {
            handleImageFiles(imageFiles);
        }
    }
}

/**
 * Handle image input change
 * @param {Event} e 
 */
export function handleImageInputChange(e) {
    if (e.target.files && e.target.files.length > 0) {
        handleImageFiles(e.target.files);
    }
}
