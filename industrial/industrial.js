/* 
  DAFTAR ISI SCRIPT:
    1. Tema Gelap / Terang
    2. Tinggi Header Dinamis
    3. Logika Ganti Bahasa (ID / EN) + Scramble Animation
*/

document.addEventListener('DOMContentLoaded', () => {

    const header = document.querySelector('header');
    const toggleBtn = document.getElementById('theme-toggle');
    
    const langBtn = document.getElementById('lang-toggle');
    const langIcon = langBtn ? langBtn.querySelector('.lang-icon') : null;
    const langText = langBtn ? langBtn.querySelector('.lang-text') : null;

    // 1. TEMA GELAP / TERANG
    function applyThemeToggle() {
        document.body.classList.toggle('light-mode');

        if (document.body.classList.contains('light-mode')) {
            toggleBtn.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'light');
        } else {
            toggleBtn.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'dark');
        }
    }

    if (toggleBtn) {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'light') {
            document.body.classList.add('light-mode');
            toggleBtn.classList.replace('fa-moon', 'fa-sun');
        }

        toggleBtn.addEventListener('click', (e) => {
            const x = e.clientX;
            const y = e.clientY;
            const endRadius = Math.hypot(
                Math.max(x, window.innerWidth - x),
                Math.max(y, window.innerHeight - y)
            );

            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            if (document.startViewTransition && !prefersReducedMotion) {
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
                applyThemeToggle();
            }
        });
    }

    // 2. TINGGI HEADER DINAMIS
    function updateHeaderHeightVar() {
        if (!header) return;
        document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
    }

    requestAnimationFrame(updateHeaderHeightVar);

    if (header && 'ResizeObserver' in window) {
        new ResizeObserver(updateHeaderHeightVar).observe(header);
    } else {
        window.addEventListener('resize', updateHeaderHeightVar);
    }

    // 3. LOGIKA GANTI BAHASA (ID / EN) + SCRAMBLE ANIMATION
    const scrambleChars = "truefalse:01;";
    let scrambleRAF = null;

    const NO_SCRAMBLE_SELECTOR = '.btn, .back-btn-header, #lang-toggle';

    function runScrambleBatch(targets, duration = 500) {
        if (!targets.length) return;
        const startTime = performance.now();
        cancelAnimationFrame(scrambleRAF);

        function frame(now) {
            const progress = Math.min((now - startTime) / duration, 1);

            targets.forEach(({ el, value }) => {
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
                targets.forEach(({ el, value }) => { el.textContent = value; });
            }
        }
        scrambleRAF = requestAnimationFrame(frame);
    }

    function applyLanguage(lang) {
        if (!langBtn) return; 

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

            if (value.includes('<')) {
                el.innerHTML = value;
                return;
            }

            if (el.closest(NO_SCRAMBLE_SELECTOR)) {
                el.textContent = value;
            } else {
                scrambleTargets.push({ el, value });
            }
        });

        runScrambleBatch(scrambleTargets, 500);

        document.documentElement.setAttribute('lang', lang === 'EN' ? 'en' : 'id');
        localStorage.setItem('user-lang', lang);
    }

    if (langBtn) {
        const savedLang = localStorage.getItem('user-lang') || 'ID';
        applyLanguage(savedLang);

        langBtn.addEventListener('click', () => {
            langBtn.style.animation = 'none';
            langBtn.offsetHeight; 
            langBtn.style.animation = 'langSlide 0.4s ease-in-out';

            const isCurrentlyID = langText.textContent.trim() === 'ID';
            const nextLang = isCurrentlyID ? 'EN' : 'ID';
            
            setTimeout(() => applyLanguage(nextLang), 200);
        });
    }

});