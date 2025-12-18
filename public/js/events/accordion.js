/**
 * ACCORDION MODULE
 * Handles accordion section toggle events
 * PromtHubs Card Creator v5.4
 */

/**
 * Bind accordion section toggle events
 */
export function bindAccordionEvents() {
    document.querySelectorAll('.section-header').forEach(header => {
        header.addEventListener('click', () => {
            const section = header.closest('.accordion-section');
            const content = section.querySelector('.section-content');
            const isExpanded = content.classList.contains('expanded');

            // Toggle
            content.classList.toggle('expanded');
            header.classList.toggle('active');

            // Save state
            const sectionId = section.dataset.section;
            localStorage.setItem(`accordion-${sectionId}`, !isExpanded);
        });
    });
}

/**
 * Restore accordion states from localStorage
 */
export function restoreAccordionStates() {
    document.querySelectorAll('.accordion-section').forEach(section => {
        const sectionId = section.dataset.section;
        const savedState = localStorage.getItem(`accordion-${sectionId}`);

        // Default: media and style open, effects and layout closed
        const defaultOpen = (sectionId === 'media' || sectionId === 'style');
        const shouldBeOpen = savedState !== null ? savedState === 'true' : defaultOpen;

        if (shouldBeOpen) {
            const header = section.querySelector('.section-header');
            const content = section.querySelector('.section-content');
            header.classList.add('active');
            content.classList.add('expanded');
        }
    });
}
