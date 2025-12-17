/**
 * TOAST NOTIFICATION UTILITY
 * User-friendly notifications
 * PromtHubs Card Creator v5.4
 */

class ToastService {
    constructor() {
        this.container = null;
    }

    _ensureContainer() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    /**
     * Show a toast notification
     * @param {string} message - Message to display
     * @param {string} type - 'info', 'success', 'warning', 'error'
     * @param {number} duration - Duration in ms
     */
    show(message, type = 'info', duration = 3000) {
        this._ensureContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        // Icon selection
        let icon = '';
        switch (type) {
            case 'success': icon = '<i class="fa-solid fa-check-circle"></i>'; break;
            case 'error': icon = '<i class="fa-solid fa-circle-exclamation"></i>'; break;
            case 'warning': icon = '<i class="fa-solid fa-triangle-exclamation"></i>'; break;
            default: icon = '<i class="fa-solid fa-circle-info"></i>';
        }

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-message">${message}</div>
            <div class="toast-close"><i class="fa-solid fa-xmark"></i></div>
        `;

        this.container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('visible');
        });

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.dismiss(toast);
        });

        // Auto dismiss
        if (duration > 0) {
            setTimeout(() => {
                this.dismiss(toast);
            }, duration);
        }
    }

    dismiss(toast) {
        toast.classList.remove('visible');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }

    success(message, duration = 3000) {
        this.show(message, 'success', duration);
    }

    error(message, duration = 4000) {
        this.show(message, 'error', duration);
    }

    info(message, duration = 3000) {
        this.show(message, 'info', duration);
    }

    warning(message, duration = 3000) {
        this.show(message, 'warning', duration);
    }
}

export const Toast = new ToastService();
