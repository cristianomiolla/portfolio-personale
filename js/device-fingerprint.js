/**
 * Device Fingerprinting Utility
 * Genera un ID univoco basato sulle caratteristiche del dispositivo
 */

class DeviceFingerprint {
    constructor() {
        this.storageKey = 'device_fingerprint_id';
    }

    /**
     * Ottiene o genera l'ID del dispositivo
     */
    async getDeviceId() {
        // Prova a recuperare da localStorage
        let deviceId = localStorage.getItem(this.storageKey);

        if (deviceId) {
            return deviceId;
        }

        // Genera nuovo fingerprint
        deviceId = await this.generateFingerprint();

        // Salva in localStorage
        localStorage.setItem(this.storageKey, deviceId);

        return deviceId;
    }

    /**
     * Genera un fingerprint basato su caratteristiche del dispositivo
     */
    async generateFingerprint() {
        const components = [
            navigator.userAgent,
            navigator.language,
            navigator.platform,
            screen.width + 'x' + screen.height,
            screen.colorDepth,
            new Date().getTimezoneOffset(),
            this.getCanvasFingerprint(),
            navigator.hardwareConcurrency || 'unknown',
            navigator.deviceMemory || 'unknown',
            this.getWebGLFingerprint()
        ];

        const fingerprintString = components.join('|');
        const hash = await this.hashString(fingerprintString);

        // Aggiungi un timestamp per renderlo più univoco
        const timestamp = Date.now().toString(36);
        return `${hash}_${timestamp}`;
    }

    /**
     * Canvas fingerprinting
     */
    getCanvasFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const text = 'fingerprint,🎨';

            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.textBaseline = 'alphabetic';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText(text, 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText(text, 4, 17);

            return canvas.toDataURL();
        } catch (e) {
            return 'canvas_error';
        }
    }

    /**
     * WebGL fingerprinting
     */
    getWebGLFingerprint() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

            if (!gl) return 'no_webgl';

            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                return `${vendor}~${renderer}`;
            }

            return 'webgl_no_debug';
        } catch (e) {
            return 'webgl_error';
        }
    }

    /**
     * Crea un hash SHA-256 di una stringa
     */
    async hashString(str) {
        // Fallback per HTTP (quando crypto.subtle non è disponibile)
        if (!window.crypto || !window.crypto.subtle) {
            console.warn('crypto.subtle non disponibile, uso hash semplice');
            return this.simpleHash(str);
        }

        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(str);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex.substring(0, 32); // Primi 32 caratteri
        } catch (e) {
            console.warn('Errore crypto.subtle, uso hash semplice:', e);
            return this.simpleHash(str);
        }
    }

    /**
     * Hash semplice per fallback (non sicuro ma funzionale)
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
    }

    /**
     * Ottiene metadati aggiuntivi per il tracking
     */
    getMetadata() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    /**
     * Resetta il fingerprint (per testing)
     */
    reset() {
        localStorage.removeItem(this.storageKey);
    }
}

// Esporta istanza singleton
window.DeviceFingerprint = DeviceFingerprint;
