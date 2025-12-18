/**
 * INPUT HANDLERS MODULE
 * Handles form inputs, sliders, toggles, and button group events
 * PromtHubs Card Creator v5.4
 */

import { updateState } from '../state.js';
import { DOM, updateUI } from '../ui.js';

/**
 * Set active button in a button group
 * @param {HTMLElement} group - Button group container
 * @param {HTMLElement} activeBtn - Button to set as active
 */
export function setActiveBtn(group, activeBtn) {
    group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    activeBtn.classList.add('active');
}

/**
 * Handle prompt text input
 * @param {Event} e 
 */
export function handlePromptInput(e) {
    updateState('promptText', e.target.value);
    updateUI();
}

/**
 * Handle font size slider change
 * @param {Event} e 
 */
export function handleFontSizeChange(e) {
    updateState('fontSize', parseInt(e.target.value));
    updateUI();
}

/**
 * Handle text position slider change
 * @param {Event} e 
 */
export function handleTextPositionChange(e) {
    updateState('textPosition', parseInt(e.target.value));
    updateUI();
}

/**
 * Handle gradient intensity slider change
 * @param {Event} e 
 */
export function handleGradientIntensityChange(e) {
    updateState('gradientIntensity', parseInt(e.target.value));
    updateUI();
}

/**
 * Handle safe zone scale slider change
 * @param {Event} e 
 */
export function handleSafeZoneScaleChange(e) {
    updateState('safeZoneScale', parseInt(e.target.value));
    updateUI();
}

/**
 * Handle model selection
 * @param {Event} e 
 */
export function handleModelChange(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    setActiveBtn(DOM.modelGroup, btn);
    updateState('model', btn.dataset.value);
    updateUI();
}

/**
 * Handle font selection
 * @param {Event} e 
 */
export function handleFontChange(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    setActiveBtn(DOM.fontGroup, btn);
    updateState('fontFamily', btn.dataset.family);
    updateUI();
}

/**
 * Handle alignment selection
 * @param {Event} e 
 */
export function handleAlignmentChange(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    setActiveBtn(DOM.alignGroup, btn);
    updateState('alignment', btn.dataset.align);
    updateUI();
}

/**
 * Handle border toggle
 * @param {Event} e 
 */
export function handleBorderToggle(e) {
    updateState('showBorder', e.target.checked);
    updateUI();
}

/**
 * Handle text visibility toggle
 * @param {Event} e 
 */
export function handleTextToggle(e) {
    updateState('showText', e.target.checked);
    updateUI();
}

/**
 * Handle blur toggle
 * @param {Event} e 
 */
export function handleBlurToggle(e) {
    updateState('blurBackground', e.target.checked);
    updateUI();
}

/**
 * Handle safe zone toggle
 * @param {Event} e 
 */
export function handleSafeZoneToggle(e) {
    updateState('safeZone', e.target.checked);
    updateUI();
}

/**
 * Handle original only toggle
 * @param {Event} e 
 */
export function handleOriginalOnlyToggle(e) {
    updateState('showOriginalOnly', e.target.checked);
    updateUI();
}
