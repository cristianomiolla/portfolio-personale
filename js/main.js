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

    });

    card.addEventListener('mouseleave', function() {
        this.classList.remove('hovered');

    });

});

// ===== ANIMAZIONI FORME GEOMETRICHE E PROFILO =====
const shapes = document.querySelectorAll('.shape');
const profileImage = document.querySelector('.profile-image');
const heroSection = document.querySelector('.hero');

// Rotazione sincronizzata con lo scroll
let lastScrollY = 0;

function updateScrollAnimations() {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = scrollY / maxScroll;

    // Animazione forme geometriche
    shapes.forEach((shape, index) => {
        // Ogni forma ruota a velocità diverse
        const rotationMultiplier = (index + 1) * 45; // 45°, 90°, 135°, etc.
        const rotation = scrollProgress * 360 * (rotationMultiplier / 180);

        shape.style.transform = `rotate(${rotation}deg)`;
    });

    // Animazione immagine profilo
    if (profileImage && heroSection) {
        // Calcola quanto la sezione hero è centrata nello schermo
        const heroRect = heroSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const heroCenter = heroRect.top + heroRect.height / 2;
        const screenCenter = windowHeight / 2;

        // Calcola la distanza dal centro (0 = perfettamente centrato)
        const distanceFromCenter = Math.abs(heroCenter - screenCenter);
        const maxDistance = windowHeight / 2;

        // Normalizza la distanza (0 = centrato, 1 = massima distanza)
        const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);

        // Applica rotazione basata sulla distanza dal centro
        // Quando è centrato (normalizedDistance = 0), rotazione = 0
        // Quando è lontano (normalizedDistance = 1), rotazione = 90°
        const profileRotation = normalizedDistance * 90;

        profileImage.style.transform = `scale(1.05) rotate(${profileRotation}deg)`;
        profileImage.style.transition = 'transform 0.1s ease-out';
    }

    lastScrollY = scrollY;
}

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

function requestScrollUpdate() {
    // Aggiorna tutte le animazioni di scroll
    updateScrollAnimations();
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(requestScrollUpdate);
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