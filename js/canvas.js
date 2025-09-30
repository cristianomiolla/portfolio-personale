// Configurazione Supabase
const SUPABASE_URL = 'https://qjesmjqwrikopklpsppt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqZXNtanF3cmlrb3BrbHBzcHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjUwMTIsImV4cCI6MjA3NDgwMTAxMn0.mDJNK27giQs9aWUeRu13OWK9SvJdNxkL8R-UIKOpYDs';

// Inizializza Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

        // Event listeners per disegno
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch events per mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });

        // Configura stile canvas per alta qualità
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

        // Scala il contesto per compensare il DPR
        this.ctx.scale(dpr, dpr);

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
        supabase
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
            const { data, error } = await supabase
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
    }

    draw(e) {
        if (!this.isDrawing) return;

        const coords = this.getCanvasCoordinates(e);
        const x1 = coords.x;
        const y1 = coords.y;

        // Disegna localmente immediatamente
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x1, y1);
        this.ctx.stroke();

        // Normalizza coordinate per salvare nel database (0-1) rispetto alle dimensioni CSS
        const rect = this.canvas.getBoundingClientRect();
        const normalizedX0 = this.lastX / rect.width;
        const normalizedY0 = this.lastY / rect.height;
        const normalizedX1 = x1 / rect.width;
        const normalizedY1 = y1 / rect.height;

        // Aggiungi al buffer per salvataggio batch
        this.pendingStrokes.push({
            x0: normalizedX0,
            y0: normalizedY0,
            x1: normalizedX1,
            y1: normalizedY1,
            color: this.currentColor,
            width: this.currentWidth
        });

        // Salva in batch se non c'è un salvataggio in corso
        if (!this.saveInProgress) {
            this.saveStrokesBatch();
        }

        this.lastX = x1;
        this.lastY = y1;
    }

    async saveStrokesBatch() {
        if (this.pendingStrokes.length === 0) return;

        this.saveInProgress = true;
        const strokesToSave = [...this.pendingStrokes];
        this.pendingStrokes = [];

        try {
            const { error } = await supabase
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
        this.ctx.lineWidth = stroke.width;
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
            const { error } = await supabase
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
