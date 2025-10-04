/**
 * Sistema di Like con Supabase
 * Gestisce like persistenti tramite device fingerprinting
 */

class LikeSystem {
    constructor(supabaseUrl, supabaseKey) {
        // Inizializza Supabase
        this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

        // Inizializza fingerprinting
        this.fingerprint = new DeviceFingerprint();

        // Stato
        this.deviceId = null;
        this.isLiked = false;
        this.totalLikes = 0;
        this.loadingComplete = false;

        // Elementi DOM
        this.likeButton = null;
        this.likeCount = null;
    }

    /**
     * Inizializza il sistema
     */
    async init() {
        try {
            // Ottieni device ID
            this.deviceId = await this.fingerprint.getDeviceId();

            // Ottieni elementi DOM
            this.likeButton = document.getElementById('like-button');
            this.likeCount = document.getElementById('like-count');

            if (!this.likeButton || !this.likeCount) {
                console.error('Like button o like count non trovato nel DOM');
                return;
            }

            // Carica stato iniziale
            await this.loadLikeState();

            // Aggiungi event listener
            this.likeButton.addEventListener('click', () => this.toggleLike());

            // Abilita real-time sync per vedere like da altri dispositivi
            this.enableRealtimeSync();
        } catch (error) {
            console.error('Errore inizializzazione like system:', error);
            this.showError();
        }
    }

    /**
     * Abilita sincronizzazione real-time
     */
    enableRealtimeSync() {
        this.supabase
            .channel('likes_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'likes' },
                async () => {
                    // Ricarica il conteggio totale quando cambia qualcosa
                    await this.reloadTotalCount();
                    this.updateUI();
                }
            )
            .subscribe();
    }

    /**
     * Carica lo stato dei like dal database
     */
    async loadLikeState() {
        try {
            // Conta totale like
            const { count, error: countError } = await this.supabase
                .from('likes')
                .select('*', { count: 'exact', head: true });

            if (countError) throw countError;

            this.totalLikes = count || 0;

            // Verifica se questo dispositivo ha già messo like
            const { data, error } = await this.supabase
                .from('likes')
                .select('*')
                .eq('device_id', this.deviceId)
                .single();

            this.isLiked = !!data;

            this.updateUI(true); // true = skip animation on initial load
        } catch (error) {
            // Se l'errore è "no rows", è normale (nessun like da questo device)
            if (error.code !== 'PGRST116') {
                console.error('Errore caricamento like state:', error);
            }
            this.updateUI(true); // true = skip animation on initial load
        }
    }

    /**
     * Toggle like (aggiungi/rimuovi)
     */
    async toggleLike() {
        if (!this.deviceId) {
            console.error('Device ID non disponibile');
            return;
        }

        // Disabilita button durante operazione
        this.likeButton.disabled = true;
        this.likeButton.classList.add('loading');

        try {
            if (this.isLiked) {
                await this.removeLike();
            } else {
                await this.addLike();
            }
        } catch (error) {
            console.error('Errore toggle like:', error);
            this.showError();
        } finally {
            this.likeButton.disabled = false;
            this.likeButton.classList.remove('loading');
        }
    }

    /**
     * Aggiungi like
     */
    async addLike() {
        const metadata = this.fingerprint.getMetadata();

        // Ottieni IP address
        let ipAddress = null;
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            ipAddress = ipData.ip;
        } catch (e) {
            console.log('Non è stato possibile recuperare l\'IP:', e);
        }

        const { error } = await this.supabase
            .from('likes')
            .insert([
                {
                    device_id: this.deviceId,
                    user_agent: metadata.userAgent,
                    ip_address: ipAddress
                }
            ]);

        if (error) {
            // Se è un errore di duplicato, ignora
            if (error.code === '23505') {
                console.log('Like già esistente');
                this.isLiked = true;
            } else {
                throw error;
            }
        } else {
            this.isLiked = true;
            this.animateLike();
        }

        // Ricarica il conteggio totale dal database
        await this.reloadTotalCount();
        this.updateUI();
    }

    /**
     * Rimuovi like
     */
    async removeLike() {
        const { error } = await this.supabase
            .from('likes')
            .delete()
            .eq('device_id', this.deviceId);

        if (error) throw error;

        this.isLiked = false;

        // Ricarica il conteggio totale dal database
        await this.reloadTotalCount();
        this.updateUI();
    }

    /**
     * Ricarica il conteggio totale dal database
     */
    async reloadTotalCount() {
        try {
            const { count, error } = await this.supabase
                .from('likes')
                .select('*', { count: 'exact', head: true });

            if (error) throw error;

            this.totalLikes = count || 0;
        } catch (error) {
            console.error('Errore ricaricamento conteggio:', error);
        }
    }

    /**
     * Aggiorna UI
     */
    updateUI(skipAnimation = false) {
        // Aggiorna contatore con animazione count-up
        const currentValue = parseInt(this.likeCount.textContent) || 0;
        const targetValue = this.totalLikes;

        if (currentValue !== targetValue) {
            // Anima solo se il loading è completo e skipAnimation è false
            if (skipAnimation || !this.loadingComplete) {
                // Imposta valore direttamente senza animazione
                this.likeCount.textContent = targetValue;
            } else {
                this.animateCounter(currentValue, targetValue);
            }
        }

        // Aggiorna stato button
        if (this.isLiked) {
            this.likeButton.classList.add('liked');
            this.likeButton.setAttribute('aria-pressed', 'true');
        } else {
            this.likeButton.classList.remove('liked');
            this.likeButton.setAttribute('aria-pressed', 'false');
        }
    }

    /**
     * Chiamato quando il loading screen finisce
     */
    onLoadingComplete() {
        this.loadingComplete = true;

        // Avvia l'animazione del counter da 0 al valore attuale
        const targetValue = this.totalLikes;
        this.likeCount.textContent = '0';
        this.animateCounter(0, targetValue);
    }

    /**
     * Anima il contatore con effetto count-up
     */
    animateCounter(from, to) {
        const duration = 800; // ms
        const frameDuration = 1000 / 60; // 60fps
        const totalFrames = Math.round(duration / frameDuration);
        let frame = 0;

        // Aggiungi classe animating per l'effetto scale
        this.likeCount.classList.add('animating');

        const counter = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;

            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(from + (to - from) * easeOut);

            this.likeCount.textContent = currentValue;

            if (frame === totalFrames) {
                clearInterval(counter);
                this.likeCount.textContent = to;

                // Rimuovi classe animating dopo l'animazione
                setTimeout(() => {
                    this.likeCount.classList.remove('animating');
                }, 100);
            }
        }, frameDuration);
    }

    /**
     * Animazione quando si mette like
     */
    animateLike() {
        this.likeButton.classList.add('animate');

        setTimeout(() => {
            this.likeButton.classList.remove('animate');
        }, 600);

        // Crea particelle che volano via
        this.createParticles();
    }

    /**
     * Crea particelle animate
     */
    createParticles() {
        const button = this.likeButton;
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.className = 'like-particle';
            particle.innerHTML = '❤️';
            particle.style.position = 'fixed';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '10000';
            particle.style.fontSize = '20px';

            document.body.appendChild(particle);

            // Animazione casuale
            const angle = (Math.PI * 2 * i) / 6;
            const distance = 50 + Math.random() * 50;
            const endX = centerX + Math.cos(angle) * distance;
            const endY = centerY + Math.sin(angle) * distance;

            particle.animate([
                {
                    transform: 'translate(0, 0) scale(1)',
                    opacity: 1
                },
                {
                    transform: `translate(${endX - centerX}px, ${endY - centerY}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => {
                particle.remove();
            };
        }
    }

    /**
     * Mostra errore
     */
    showError() {
        this.likeButton.classList.add('error');
        setTimeout(() => {
            this.likeButton.classList.remove('error');
        }, 2000);
    }

    /**
     * Get total likes (metodo pubblico)
     */
    async getTotalLikes() {
        try {
            const { count, error } = await this.supabase
                .from('likes')
                .select('*', { count: 'exact', head: true });

            if (error) throw error;

            return count || 0;
        } catch (error) {
            console.error('Errore get total likes:', error);
            return 0;
        }
    }
}

// Esporta per uso globale
window.LikeSystem = LikeSystem;
