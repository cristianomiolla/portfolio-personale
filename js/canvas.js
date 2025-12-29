// Configurazione Supabase
const SUPABASE_URL = 'https://qjesmjqwrikopklpsppt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqZXNtanF3cmlrb3BrbHBzcHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjUwMTIsImV4cCI6MjA3NDgwMTAxMn0.mDJNK27giQs9aWUeRu13OWK9SvJdNxkL8R-UIKOpYDs';

// Inizializza Supabase client (usa nome non in conflitto e memorizza su window)
const supabaseClient = window.supabaseClient || window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabaseClient = supabaseClient;

class CollaborativeCanvas {
    constructor() {
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentColor = '#000000';
        this.currentWidth = 3;
        this.lastX = 0;
        this.lastY = 0;
        this.pendingStrokes = []; // Buffer per strokes da salvare
        this.saveInProgress = false;

        this.initCanvas();
        this.initControls();
        this.initSupabase();
    }

    initCanvas() {
        // Imposta dimensioni canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Inizializza variabili per smoothing
        this.lastMidX = 0;
        this.lastMidY = 0;
        this.currentPointerId = null;

        // Preferisci Pointer Events (gestisce mouse/touch/pen con pressione)
        this.canvas.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            this.startDrawing(e);
            if (e.pointerId && this.canvas.setPointerCapture) {
                try { this.canvas.setPointerCapture(e.pointerId); } catch (err) {}
                this.currentPointerId = e.pointerId;
            }
        });

        this.canvas.addEventListener('pointermove', (e) => this.draw(e));
        this.canvas.addEventListener('pointerup', (e) => {
            this.stopDrawing();
            if (e.pointerId && this.canvas.releasePointerCapture) {
                try { this.canvas.releasePointerCapture(e.pointerId); } catch (err) {}
                this.currentPointerId = null;
            }
        });
        this.canvas.addEventListener('pointercancel', () => this.stopDrawing());
        this.canvas.addEventListener('pointerout', () => this.stopDrawing());

        // Se il wrapper intercetta gli eventi (es. overlay o plugin), inoltra i pointer events al canvas
        const wrapper = this.canvas.closest('.canvas-wrapper');
        if (wrapper) {
            wrapper.addEventListener('pointerdown', (e) => {
                if (e.target !== this.canvas) {
                    try {
                        const ev = new PointerEvent('pointerdown', { clientX: e.clientX, clientY: e.clientY, pointerId: e.pointerId, pointerType: e.pointerType });
                        this.canvas.dispatchEvent(ev);
                    } catch (err) {
                        const me = new MouseEvent('mousedown', { clientX: e.clientX, clientY: e.clientY });
                        this.canvas.dispatchEvent(me);
                    }
                }
            });
            wrapper.addEventListener('pointermove', (e) => {
                if (e.pressure !== 0) {
                    try {
                        const ev = new PointerEvent('pointermove', { clientX: e.clientX, clientY: e.clientY, pointerId: e.pointerId, pointerType: e.pointerType, pressure: e.pressure });
                        this.canvas.dispatchEvent(ev);
                    } catch (err) {
                        const me = new MouseEvent('mousemove', { clientX: e.clientX, clientY: e.clientY });
                        this.canvas.dispatchEvent(me);
                    }
                }
            });
            wrapper.addEventListener('pointerup', (e) => {
                try {
                    const ev = new PointerEvent('pointerup', { clientX: e.clientX, clientY: e.clientY });
                    this.canvas.dispatchEvent(ev);
                } catch (err) {
                    const me = new MouseEvent('mouseup', {});
                    this.canvas.dispatchEvent(me);
                }
            });
        }

        // Configura stile canvas per alta qualità e angoli stondati
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        // Imposta dimensioni reali del canvas considerando il DPR per alta qualità
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        // Mantieni dimensioni CSS
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';

        // Reset del transform e scala il contesto per compensare il DPR (evita accumulo di scale su resize)
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Configura stile per alta qualità
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';

        // Ricarica disegni esistenti dopo il resize
        this.loadAllStrokes();
    }

    initControls() {
        // Color picker
        const colorBtns = document.querySelectorAll('.color-btn');
        colorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                colorBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentColor = btn.dataset.color;
            });
        });

        // Brush size
        const brushSize = document.getElementById('brushSize');
        const brushSizeValue = document.getElementById('brushSizeValue');
        brushSize.addEventListener('input', (e) => {
            this.currentWidth = e.target.value;
            brushSizeValue.textContent = e.target.value;
        });

        // Clear button
        const clearBtn = document.getElementById('clearCanvas');
        clearBtn.addEventListener('click', () => {
            this.clearCanvas();
        });
    }

    async initSupabase() {
        // Carica tutti i disegni esistenti
        await this.loadAllStrokes();

        // Iscriviti agli aggiornamenti in tempo reale
        supabaseClient
            .channel('canvas_changes')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'canvas_strokes' },
                (payload) => {
                    // Disegna gli stroke che arrivano da altri utenti
                    this.drawStroke(payload.new);
                }
            )
            .on('postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'canvas_strokes' },
                () => {
                    this.clearCanvasLocal();
                    this.loadAllStrokes();
                }
            )
            .subscribe();
    }

    async loadAllStrokes() {
        try {
            const { data, error } = await supabaseClient
                .from('canvas_strokes')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Errore nel caricamento dei disegni:', error);
                return;
            }

            if (data && data.length > 0) {
                data.forEach(stroke => this.drawStroke(stroke));
            }
        } catch (err) {
            console.error('Errore:', err);
        }
    }

    getCanvasCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = rect.width / (this.canvas.width / (window.devicePixelRatio || 1));
        const scaleY = rect.height / (this.canvas.height / (window.devicePixelRatio || 1));

        return {
            x: (e.clientX - rect.left) / scaleX,
            y: (e.clientY - rect.top) / scaleY
        };
    }

    startDrawing(e) {
        this.isDrawing = true;
        const coords = this.getCanvasCoordinates(e);
        this.lastX = coords.x;
        this.lastY = coords.y;
        this.lastMidX = this.lastX;
        this.lastMidY = this.lastY;

        // Se è un PointerEvent, cattura il puntatore
        if (e && e.pointerId && this.canvas.setPointerCapture) {
            try { this.canvas.setPointerCapture(e.pointerId); } catch (err) {}
            this.currentPointerId = e.pointerId;
        }
    }

    draw(e) {
        if (!this.isDrawing) return;

        const coords = this.getCanvasCoordinates(e);
        const x = coords.x;
        const y = coords.y;

        const dpr = window.devicePixelRatio || 1;
        const effectiveLineWidth = this.currentWidth * dpr;

        // Calcola punto medio per smoothing (midpoint quadratic)
        const midX = (this.lastX + x) / 2;
        const midY = (this.lastY + y) / 2;

        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = effectiveLineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastMidX, this.lastMidY);
        this.ctx.quadraticCurveTo(this.lastX, this.lastY, midX, midY);
        this.ctx.stroke();

        // Normalizza coordinate per salvare nel database (0-1) rispetto alle dimensioni CSS
        const rect = this.canvas.getBoundingClientRect();
        this.pendingStrokes.push({
            x0: this.lastX / rect.width,
            y0: this.lastY / rect.height,
            x1: x / rect.width,
            y1: y / rect.height,
            color: this.currentColor,
            width: this.currentWidth
        });

        // Salva in batch se non c'è un salvataggio in corso
        if (!this.saveInProgress) {
            this.saveStrokesBatch();
        }

        // Aggiorna punti di riferimento
        this.lastX = x;
        this.lastY = y;
        this.lastMidX = midX;
        this.lastMidY = midY;
    }

    async saveStrokesBatch() {
        if (this.pendingStrokes.length === 0) return;

        this.saveInProgress = true;
        const strokesToSave = [...this.pendingStrokes];
        this.pendingStrokes = [];

        try {
            const { error } = await supabaseClient
                .from('canvas_strokes')
                .insert(strokesToSave);

            if (error) {
                console.error('Errore nel salvataggio batch:', error);
            }
        } catch (err) {
            console.error('Errore:', err);
        }

        this.saveInProgress = false;

        // Se ci sono nuovi strokes nel frattempo, salvali
        if (this.pendingStrokes.length > 0) {
            setTimeout(() => this.saveStrokesBatch(), 50);
        }
    }

    stopDrawing() {
        this.isDrawing = false;
        if (this.currentPointerId && this.canvas.releasePointerCapture) {
            try { this.canvas.releasePointerCapture(this.currentPointerId); } catch (err) {}
            this.currentPointerId = null;
        }
    }

    drawStroke(stroke) {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();

        // Denormalizza coordinate rispetto alle dimensioni CSS
        const x0 = stroke.x0 * rect.width;
        const y0 = stroke.y0 * rect.height;
        const x1 = stroke.x1 * rect.width;
        const y1 = stroke.y1 * rect.height;

        this.ctx.strokeStyle = stroke.color;
        this.ctx.lineWidth = (stroke.width || this.currentWidth) * dpr;
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.stroke();
    }

    clearCanvasLocal() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    async clearCanvas() {
        try {
            // Elimina tutti i record dal database
            const { error } = await supabaseClient
                .from('canvas_strokes')
                .delete()
                .neq('id', 0); // Elimina tutto

            if (error) {
                console.error('Errore nella pulizia:', error);
                alert('Errore nella pulizia della lavagna. Riprova.');
                return;
            }

            // Pulisci canvas locale
            this.clearCanvasLocal();
        } catch (err) {
            console.error('Errore:', err);
            alert('Errore nella pulizia della lavagna. Riprova.');
        }
    }
}

// Inizializza canvas quando la pagina è pronta
window.addEventListener('DOMContentLoaded', () => {
    new CollaborativeCanvas();
});
