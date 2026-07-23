/* 
  DAFTAR ISI SCRIPT:
    1. Lightbox Control
    2. Marquee Animation & Drag Control
    3. Scroll & Navigation Observer
    4. Typing Effect
    5. Theme Toggle & Image Sync
    6. Language Switcher & Scramble Effect
    7. Mobile Sidebar Menu
    8. Project & Industrial Card Interaction
    9. Contact Form Email Sender
    10. Scroll Restoration & AOS Initialization
*/

// LIGHTBOX CONTROL
function openCertificate(imageSrc) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    lightboxImg.src = imageSrc;
    lightbox.style.display = 'flex';
}

document.getElementById('lightbox').onclick = function(e) {
    if (e.target !== document.getElementById('lightbox-img')) {
        this.style.display = 'none';
    }
};

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
    }
}

const closeBtn = document.getElementById('close');
if (closeBtn) {
    closeBtn.onclick = closeLightbox;
}

// MARQUEE ANIMATION & DRAG CONTROL
const wrapper = document.querySelector('.marquee-wrapper');
const track = document.querySelector('.marquee-track');

const content = track.innerHTML;
track.innerHTML += content;

const baseSpeed = 0.6;
let scrollPos = 0;
let velocity = 0;
let isDragging = false;
let isHovering = false;
let startX = 0, startY = 0, lastX = 0, lastTime = 0;
let isHorizontalDrag = null;
let dragDeltaSum = 0;

function getHalfWidth() {
    return track.scrollWidth / 2;
}

function normalizePos() {
    const half = getHalfWidth();
    if (half <= 0) return;
    while (scrollPos <= -half) scrollPos += half;
    while (scrollPos > 0) scrollPos -= half;
}

let isMarqueeVisible = true;

function animate(time) {
    if (!lastTime) lastTime = time;
    const delta = time - lastTime;
    lastTime = time;
    const dtScale = Math.min(delta / (1000 / 60), 3);

    if (isDragging) {
        velocity = 0;
    } else if (Math.abs(velocity) > 0.01) {
        scrollPos += velocity * dtScale;
        velocity *= 0.95;
    } else if (!isHovering) {
        scrollPos -= baseSpeed * dtScale;
    }

    normalizePos();
    track.style.transform = `translateX(${scrollPos}px)`;
    if (isMarqueeVisible) requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const wasVisible = isMarqueeVisible;
        isMarqueeVisible = entry.isIntersecting;
        if (isMarqueeVisible && !wasVisible) {
            lastTime = 0;
            requestAnimationFrame(animate);
        }
    });
}, { threshold: 0 }).observe(wrapper);

wrapper.addEventListener('mouseenter', () => { isHovering = true; });
wrapper.addEventListener('mouseleave', () => { isHovering = false; });

const CLICK_SUPPRESS_THRESHOLD = 6;
let totalDragDistance = 0;
let suppressNextClick = false;

function dragStart(x, y) {
    isDragging = true;
    velocity = 0;
    startX = x;
    startY = y;
    lastX = x;
    lastTime = 0;
    isHorizontalDrag = null;
    dragDeltaSum = 0;
    totalDragDistance = 0;
    wrapper.classList.add('active-drag');
}

function dragMove(x) {
    if (!isDragging) return;
    const delta = x - lastX;
    totalDragDistance += Math.abs(delta);
    scrollPos += delta;
    velocity = delta;
    lastX = x;
}

function dragEnd() {
    isDragging = false;
    wrapper.classList.remove('active-drag');

    if (totalDragDistance > CLICK_SUPPRESS_THRESHOLD) {
        suppressNextClick = true;
    }
}

wrapper.addEventListener('click', (e) => {
    if (suppressNextClick) {
        e.stopPropagation();
        e.preventDefault();
        suppressNextClick = false;
    }
}, true);

wrapper.addEventListener('mousedown', (e) => dragStart(e.pageX, e.pageY));
window.addEventListener('mousemove', (e) => { if (isDragging) dragMove(e.pageX); });
window.addEventListener('mouseup', dragEnd);

wrapper.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    dragStart(t.pageX, t.pageY);
}, { passive: true });

wrapper.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const t = e.touches[0];

    if (isHorizontalDrag === null) {
        const diffX = Math.abs(t.pageX - startX);
        const diffY = Math.abs(t.pageY - startY);
        dragDeltaSum = Math.max(diffX, diffY);
        if (dragDeltaSum > 6) {
            isHorizontalDrag = diffX > diffY;
        }
    }

    if (isHorizontalDrag) {
        e.preventDefault();
        dragMove(t.pageX);
    } else if (isHorizontalDrag === false) {
        dragEnd();
    }
}, { passive: false });

wrapper.addEventListener('touchend', dragEnd);
wrapper.addEventListener('touchcancel', dragEnd);

// SCROLL & NAVIGATION OBSERVER
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");
const header = document.querySelector("header");

let lastScroll = 0;
let isMenuClick = false;

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => link.classList.remove("active"));
            const targetLink = document.querySelector('nav a[href="#' + entry.target.id + '"]');
            if (targetLink) targetLink.classList.add("active");
        }
    });
}, { threshold: 0.3 });

sections.forEach(section => observer.observe(section));

function headerScroll() {
    if (isMenuClick) return;
    const currentScroll = window.scrollY;
    if (currentScroll > lastScroll && currentScroll > 120) {
        header.classList.add("hide");
    } else {
        header.classList.remove("hide");
    }
    lastScroll = currentScroll;
}
window.addEventListener("scroll", headerScroll);

navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        isMenuClick = true;
        header.classList.remove("hide");
        navLinks.forEach(item => item.classList.remove("active"));
        link.classList.add("active");
        setTimeout(() => { isMenuClick = false; }, 800);

        if (isMobileView()) {
            e.preventDefault();
            const targetEl = document.querySelector(link.getAttribute('href'));
            closeSidebar();
            setTimeout(() => {
                if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 360);
        }
    });
});

// TYPING EFFECT
const words = ["Web Developer", "Android Developer", "UI/UX Designer", "Software Engineer", "Informatics Student"];
const typingSpan = document.querySelector(".typing-text span");
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
    if (!typingSpan) return;
    const currentWord = words[wordIndex];
    if (!isDeleting) {
        typingSpan.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === currentWord.length) {
            isDeleting = true;
            setTimeout(typeEffect, 1800);
            return;
        }
    } else {
        typingSpan.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
        }
    }
    setTimeout(typeEffect, isDeleting ? 50 : 100);
}
typeEffect();

// THEME TOGGLE & IMAGE SYNC
const toggleBtn = document.getElementById('theme-toggle');
const profileImg = document.getElementById('home-profile-img');
const contactImg = document.getElementById('contact-profile-img');

function syncThemeImages(){
    const isLight = document.body.classList.contains('light-mode');
    if (profileImg) profileImg.src = isLight ? 'images/profile/main-light.png' : 'images/profile/main-dark.png';
    if (contactImg) contactImg.src = isLight ? 'images/profile/main-light.png' : 'images/profile/main-dark.png';
}

const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'light') {
    document.body.classList.add('light-mode');
    toggleBtn.classList.replace('fa-moon', 'fa-sun');
}
syncThemeImages();

function applyThemeToggle() {
    document.body.classList.toggle('light-mode');
    const profileImg = document.getElementById('home-profile-img');

    if (document.body.classList.contains('light-mode')) {
        toggleBtn.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'light');

        if(profileImg) profileImg.src = 'images/profile/main-light.png';
    } else {
        toggleBtn.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'dark');

        if(profileImg) profileImg.src = 'images/profile/main-dark.png';
    }
    syncThemeImages();

    if (typeof updateLauncherDisplay === 'function') {
        updateLauncherDisplay();
    }
}

toggleBtn.addEventListener('click', () => {
    const rect = toggleBtn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
    );

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        applyThemeToggle();
    } else if (document.startViewTransition) {
        const transition = document.startViewTransition(() => applyThemeToggle());
        transition.ready.then(() => {
            document.documentElement.animate(
                {
                    clipPath: [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${endRadius}px at ${x}px ${y}px)`
                    ]
                },
                {
                    duration: 600,
                    easing: 'ease-in-out',
                    pseudoElement: '::view-transition-new(root)'
                }
            );
        });
    } else {
        const oldBg = getComputedStyle(document.body).backgroundColor;
        const overlay = document.createElement('div');
        overlay.style.cssText = `position:fixed;inset:0;z-index:99999;pointer-events:none;background:${oldBg};`;
        document.body.appendChild(overlay);

        applyThemeToggle();

        const anim = overlay.animate(
            {
                clipPath: [
                    `circle(${endRadius}px at ${x}px ${y}px)`,
                    `circle(0px at ${x}px ${y}px)`
                ]
            },
            { duration: 600, easing: 'ease-in-out' }
        );
        anim.onfinish = () => overlay.remove();
    }
});

// LANGUAGE SWITCHER & SCRAMBLE EFFECT
const langBtn = document.getElementById('lang-toggle');
const langIcon = langBtn.querySelector('.lang-icon');
const langText = langBtn.querySelector('.lang-text');

const scrambleChars = "truefalse:01;";
let scrambleRAF = null;

function runScrambleBatch(targets, duration = 500, onComplete) {
    if (!targets.length) { if (onComplete) onComplete(); return; }
    const startTime = performance.now();
    cancelAnimationFrame(scrambleRAF);

    function frame(now) {
        const progress = Math.min((now - startTime) / duration, 1);

        targets.forEach(({ el, value, isHTML }) => {
            if (isHTML) {
                el.innerHTML = value;
                return;
            }

            const settledCount = Math.floor(progress * value.length);
            let output = "";
            for (let i = 0; i < value.length; i++) {
                const ch = value[i];
                if (ch === " " || ch === "\n") {
                    output += ch;
                } else if (i < settledCount) {
                    output += ch;
                } else {
                    output += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                }
            }
            el.textContent = output;
        });

        if (progress < 1) {
            scrambleRAF = requestAnimationFrame(frame);
        } else {
            targets.forEach(({ el, value, isHTML }) => {
                if (isHTML) {
                    el.innerHTML = value;
                } else {
                    el.textContent = value;
                }
            });
            if (onComplete) onComplete();
        }
    }
    scrambleRAF = requestAnimationFrame(frame);
}

function applyLanguage(lang) {
    if (lang === 'EN') {
        langText.textContent = 'EN';
        langIcon.textContent = '🇺🇸';
    } else {
        langText.textContent = 'ID';
        langIcon.textContent = '🇮🇩';
    }

    const scrambleTargets = [];

    document.querySelectorAll('[data-lang-en]').forEach(el => {
        const value = lang === 'EN'
            ? el.getAttribute('data-lang-en')
            : el.getAttribute('data-lang-id');
        if (value === null) return;

        const isHTML = value.includes('<');
        scrambleTargets.push({ el, value, isHTML });
    });

    scrambleTargets.forEach(({ el }) => {
        const width = el.getBoundingClientRect().width;
        el.style.minWidth = width + 'px';
    });

    runScrambleBatch(scrambleTargets, 500, () => {
        scrambleTargets.forEach(({ el }) => { el.style.minWidth = ''; });
    });

    document.querySelectorAll('[data-placeholder-en]').forEach(el => {
        const value = lang === 'EN'
            ? el.getAttribute('data-placeholder-en')
            : el.getAttribute('data-placeholder-id');
        if (value !== null) el.setAttribute('placeholder', value);
    });

    localStorage.setItem('user-lang', lang);
}

function updateHeaderHeightVar() {
    const h = header.offsetHeight;
    document.documentElement.style.setProperty('--header-height', h + 'px');
}

requestAnimationFrame(updateHeaderHeightVar);

const headerResizeObserver = new ResizeObserver(() => {
    updateHeaderHeightVar();
});
headerResizeObserver.observe(header);

// MOBILE SIDEBAR MENU
const navEl = document.getElementById('navbar');
const navOverlay = document.getElementById('nav-overlay');
const logoBtn = document.getElementById('logo-btn');
const MOBILE_BREAKPOINT = 995;

function isMobileView() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
}

function openSidebar() {
    navEl.classList.add('active');
    navOverlay.classList.add('active');
    document.body.classList.add('sidebar-open');
}

function closeSidebar() {
    navEl.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.classList.remove('sidebar-open');
}

function toggleSidebar() {
    if (navEl.classList.contains('active')) {
        closeSidebar();
    } else {
        openSidebar();
    }
}

navOverlay.addEventListener('click', closeSidebar);

logoBtn.addEventListener('click', (e) => {
    if (isMobileView()) {
        e.preventDefault();
        toggleSidebar();
    }
});

let touchStartX = null;
let touchStartY = null;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    if (!isMobileView() || touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (touchStartX < 30 && deltaX > 60 && Math.abs(deltaX) > Math.abs(deltaY)) {
        openSidebar();
    }
    if (navEl.classList.contains('active') && deltaX < -60 && Math.abs(deltaX) > Math.abs(deltaY)) {
        closeSidebar();
    }

    touchStartX = null;
    touchStartY = null;
}, { passive: true });

window.addEventListener('pageshow', () => {
    if (!navEl.classList.contains('active')) {
        document.body.classList.remove('sidebar-open');
    }
});

// PROJECT & INDUSTRIAL CARD INTERACTION
const supportsHover = window.matchMedia('(hover: hover)').matches;

document.querySelectorAll('#projects .project-card').forEach(card => {
    card.addEventListener('click', () => {
        const url = card.getAttribute('data-url');
        if (!url) return;

        if (supportsHover) {
            window.open(url, '_blank');
        } else {
            if (card.classList.contains('show-overlay')) {
                window.open(url, '_blank');
            } else {
                document.querySelectorAll('#projects .project-card.show-overlay')
                    .forEach(c => { if (c !== card) c.classList.remove('show-overlay'); });
                card.classList.add('show-overlay');
            }
        }
    });
});

document.querySelectorAll('#industrial-visit .industrial-card').forEach(card => {
    card.addEventListener('click', () => {
        const url = card.getAttribute('data-url');
        if (!url) return;

        if (supportsHover) {
            window.open(url, '_blank');
        } else {
            if (card.classList.contains('show-overlay')) {
                window.open(url, '_blank');
            } else {
                document.querySelectorAll('#industrial-visit .industrial-card.show-overlay')
                    .forEach(c => { if (c !== card) c.classList.remove('show-overlay'); });
                card.classList.add('show-overlay');
            }
        }
    });
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.project-card')) {
        document.querySelectorAll('#projects .project-card.show-overlay').forEach(c => c.classList.remove('show-overlay'));
    }
    if (!e.target.closest('.industrial-card')) {
        document.querySelectorAll('#industrial-visit .industrial-card.show-overlay').forEach(c => c.classList.remove('show-overlay'));
    }
});

// CONTACT FORM EMAIL SENDER
function sendContactMessage() {
    const textarea = document.getElementById('contact-message');
    const message = textarea ? textarea.value.trim() : '';
    const emailTujuan = 'rajaalsofiandri@gmail.com';

    if (!message) {
        textarea.focus();
        return;
    }

    const subject = encodeURIComponent('Pesan dari Portfolio Website');
    const body = encodeURIComponent(message);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${emailTujuan}&su=${subject}&body=${body}`;

    const newTab = window.open(gmailUrl, '_blank');
    if (!newTab) {
        window.location.href = `mailto:${emailTujuan}?subject=${subject}&body=${body}`;
    }
}

const savedLang = localStorage.getItem('user-lang') || 'ID';
applyLanguage(savedLang);

langBtn.addEventListener('click', () => {
    langBtn.style.animation = 'none';
    langBtn.offsetHeight;
    langBtn.style.animation = 'langSlide 0.4s ease-in-out';

    const nextLang = langText.textContent === 'ID' ? 'EN' : 'ID';
    setTimeout(() => applyLanguage(nextLang), 200);
});

// Scroll Restoration & AOS Initialization
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

if (typeof AOS !== 'undefined') {
    AOS.init({
        duration: 1000,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        once: true
    });
}