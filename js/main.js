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
    const animatedElements = document.querySelectorAll('.business-card-section, .portfolio, .project-card');

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
        const isMobile = window.innerWidth <= 768;

        // Su mobile, usa logica semplificata basata direttamente sullo scroll
        if (isMobile) {
            // Se siamo alla cima (primi 10px) forza reset completo
            if (scrollY <= 10) {
                profileImage.style.transform = 'scale(1.0) rotate(0deg)';
                profileImage.style.transition = 'transform 0.3s ease-out';
            } else {
                // Rotazione proporzionale allo scroll dall'inizio
                const maxRotationScroll = 300; // Rotazione massima raggiunta a 300px di scroll
                const scrollProgress = Math.min(scrollY / maxRotationScroll, 1);

                const finalRotation = scrollProgress * 45; // Massimo 45 gradi su mobile
                const finalScale = 1.0 + (scrollProgress * 0.05); // Scaling più leggero

                profileImage.style.transform = `scale(${finalScale}) rotate(${finalRotation}deg)`;
                profileImage.style.transition = 'transform 0.2s ease-out';
            }
        } else {
            // Logica originale per desktop
            const heroRect = heroSection.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const heroCenter = heroRect.top + heroRect.height / 2;
            const screenCenter = windowHeight / 2;

            const distanceFromCenter = Math.abs(heroCenter - screenCenter);
            const maxDistance = windowHeight / 2;
            const normalizedDistance = Math.min(distanceFromCenter / maxDistance, 1);

            const profileRotation = normalizedDistance * 90;
            const profileScale = normalizedDistance > 0.1 ? 1.05 : 1.0;

            profileImage.style.transform = `scale(${profileScale}) rotate(${profileRotation}deg)`;
            profileImage.style.transition = 'transform 0.1s ease-out';
        }
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
let scrollEndTimer = null;

function requestScrollUpdate() {
    // Aggiorna tutte le animazioni di scroll
    updateScrollAnimations();
    ticking = false;
}

// Funzione per gestire la fine dello scroll su mobile
function handleScrollEnd() {
    const profileImage = document.querySelector('.profile-image');
    const isMobile = window.innerWidth <= 768;

    if (isMobile && profileImage && window.scrollY <= 20) {
        // Forza reset completo quando lo scroll si ferma vicino alla cima
        profileImage.style.transform = 'scale(1.0) rotate(0deg)';
        profileImage.style.transition = 'transform 0.3s ease-out';
    }
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(requestScrollUpdate);
        ticking = true;
    }

    // Su mobile, gestisci anche la fine dello scroll
    if (window.innerWidth <= 768) {
        clearTimeout(scrollEndTimer);
        scrollEndTimer = setTimeout(handleScrollEnd, 150);
    }
});

// Aggiungi supporto per scrollend su browser moderni
if ('onscrollend' in window) {
    window.addEventListener('scrollend', handleScrollEnd);
}

// Gestione touch events per mobile
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].clientY;

    // Se l'utente ha scrollato verso l'alto e siamo vicini alla cima
    if (touchStartY < touchEndY && window.scrollY <= 20) {
        setTimeout(handleScrollEnd, 100);
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