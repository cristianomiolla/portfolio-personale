// ===== SCROLL ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

// Intersection Observer per animazioni fade-in
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// ===== INIZIALIZZAZIONE AL CARICAMENTO =====
document.addEventListener('DOMContentLoaded', function() {
    // Applica animazioni fade-in a sezioni e card
    const animatedElements = document.querySelectorAll('.contact, .portfolio, .project-card');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Animazione ritardata per le card del portfolio
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transitionDelay = `${index * 0.1}s`;
        }, 100);
    });
});

// ===== SMOOTH SCROLL PER LINK INTERNI =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== EFFETTI HOVER AVANZATI =====
const projectCards = document.querySelectorAll('.project-card');

projectCards.forEach(card => {
    const image = card.querySelector('.project-image img');
    const overlay = card.querySelector('.project-overlay');

    card.addEventListener('mouseenter', function() {
        // Aggiunge classe per animazioni CSS personalizzate
        this.classList.add('hovered');

        // Animazione parallax leggera dell'immagine
        if (image) {
            image.style.transform = 'scale(1.1) rotate(1deg)';
        }
    });

    card.addEventListener('mouseleave', function() {
        this.classList.remove('hovered');

        if (image) {
            image.style.transform = 'scale(1) rotate(0deg)';
        }
    });

    // Effetto di movimento del mouse per overlay
    card.addEventListener('mousemove', function(e) {
        if (overlay) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const xPercent = (x / rect.width - 0.5) * 20;
            const yPercent = (y / rect.height - 0.5) * 20;

            overlay.style.transform = `translate(${xPercent}px, ${yPercent}px)`;
        }
    });

    card.addEventListener('mouseleave', function() {
        if (overlay) {
            overlay.style.transform = 'translate(0, 0)';
        }
    });
});

// ===== ANIMAZIONI FORME GEOMETRICHE =====
const shapes = document.querySelectorAll('.shape');

// Movimento interattivo delle forme con il mouse
document.addEventListener('mousemove', function(e) {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.5;
        const x = (mouseX - 0.5) * speed;
        const y = (mouseY - 0.5) * speed;

        shape.style.transform += ` translate(${x}px, ${y}px)`;
    });
});

// ===== PRESTAZIONI E OTTIMIZZAZIONI =====
// Throttle per eventi di scroll e resize
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Ottimizzazione scroll per dispositivi mobili
let ticking = false;

function updateScrollAnimations() {
    // Aggiorna animazioni basate su scroll se necessario
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(updateScrollAnimations);
        ticking = true;
    }
});

// ===== GESTIONE ERRORI CARICAMENTO IMMAGINI =====
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
        // Sostituisce immagini mancanti con placeholder
        this.style.backgroundColor = '#f0f0f0';
        this.style.display = 'flex';
        this.style.alignItems = 'center';
        this.style.justifyContent = 'center';
        this.innerHTML = '<span style="color: #999; font-size: 14px;">Immagine non disponibile</span>';
    });
});

// ===== ACCESSIBILITÀ =====
// Gestione focus per accessibilità keyboard
document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
});

// ===== PRELOADER SEMPLICE =====
window.addEventListener('load', function() {
    document.body.classList.add('loaded');

    // Fade in graduale del contenuto
    setTimeout(() => {
        document.querySelector('.hero').style.opacity = '1';
    }, 100);
});