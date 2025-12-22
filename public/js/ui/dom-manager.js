/**
 * DOM MANAGER
 * UI katmanı - DOM element referanslarını yönetir
 * SOLID: SRP - Sadece DOM referanslarından sorumlu
 */

/**
 * DOM elements cache
 */
export const DOM = {
    // Inputs
    imageInput: null,
    dropZone: null,
    imageGallery: null,
    colorPalette: null,
    promptInput: null,
    fontSizeSlider: null,
    fontSizeVal: null,
    posSlider: null,
    posVal: null,

    // Gradient Controls
    gradControlGroup: null,
    gradSlider: null,
    gradVal: null,

    // Safe Zone Inputs
    safeZoneControls: null,
    szScaleSlider: null,
    szScaleVal: null,

    // Button groups
    modelGroup: null,
    fontGroup: null,
    alignGroup: null,

    // Toggles
    checkBorder: null,
    checkText: null,
    checkBlur: null,
    checkSafeZone: null,
    checkOriginalOnly: null,

    // Buttons
    btnExport: null,
    btnRemix: null,

    // Canvas Elements
    exportCanvas: null,
    canvasBlurFill: null,
    canvasBg: null,
    canvasOverlay: null,
    textContainer: null,
    modelBadge: null,
    promptText: null,
    promptLabel: null,
    topBranding: null,
    topBrandingSpan: null,
    mainBorder: null,

    // Hidden Analysis
    analysisCanvas: null
};

/**
 * Initialize DOM element references
 * @returns {void}
 */
export function initDOM() {
    // Inputs
    DOM.imageInput = document.getElementById('imageInput');
    DOM.dropZone = document.getElementById('dropZone');
    DOM.imageGallery = document.getElementById('imageGallery');
    DOM.colorPalette = document.getElementById('colorPalette');
    DOM.promptInput = document.getElementById('promptInput');
    DOM.fontSizeSlider = document.getElementById('fontSizeSlider');
    DOM.fontSizeVal = document.getElementById('fontSizeVal');
    DOM.posSlider = document.getElementById('posSlider');
    DOM.posVal = document.getElementById('posVal');

    // Gradient Controls
    DOM.gradControlGroup = document.getElementById('gradControlGroup');
    DOM.gradSlider = document.getElementById('gradSlider');
    DOM.gradVal = document.getElementById('gradVal');

    // Safe Zone Inputs
    DOM.safeZoneControls = document.getElementById('safeZoneControls');
    DOM.szScaleSlider = document.getElementById('szScaleSlider');
    DOM.szScaleVal = document.getElementById('szScaleVal');

    // Button groups
    DOM.modelGroup = document.getElementById('modelGroup');
    DOM.fontGroup = document.getElementById('fontGroup');
    DOM.alignGroup = document.getElementById('alignGroup');

    // Toggles
    DOM.checkBorder = document.getElementById('checkBorder');
    DOM.checkText = document.getElementById('checkText');
    DOM.checkBlur = document.getElementById('checkBlur');
    DOM.checkSafeZone = document.getElementById('checkSafeZone');
    DOM.checkOriginalOnly = document.getElementById('checkOriginalOnly');

    // Buttons
    DOM.btnExport = document.getElementById('btnExport');
    DOM.btnRemix = document.getElementById('btnRemix');

    // Canvas Elements
    DOM.exportCanvas = document.getElementById('exportCanvas');
    DOM.canvasBlurFill = document.getElementById('canvasBlurFill');
    DOM.canvasBg = document.getElementById('canvasBg');
    DOM.canvasOverlay = document.getElementById('canvasOverlay');
    DOM.textContainer = document.getElementById('textContainer');
    DOM.modelBadge = document.getElementById('modelBadge');
    DOM.promptText = document.getElementById('promptText');
    DOM.promptLabel = document.getElementById('promptLabel');
    DOM.topBranding = document.querySelector('.top-branding');
    DOM.topBrandingSpan = document.querySelector('.top-branding span');
    DOM.mainBorder = document.getElementById('mainBorder');

    // Hidden Analysis
    DOM.analysisCanvas = document.getElementById('analysisCanvas');
}

/**
 * Get a DOM element by ID with null check
 * @param {string} id - Element ID
 * @returns {HTMLElement|null}
 */
export function getElement(id) {
    return document.getElementById(id);
}
