// Attend que le DOM soit entièrement chargé
document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. LOGIQUE PREMIUM : CURSEUR PERSONNALISÉ
    // ==========================================
    // Vérifie si on est sur un ordinateur (pour ne pas afficher le curseur sur mobile tactile)
    if (window.matchMedia("(pointer: fine)").matches) {
        const cursor = document.createElement('div');
        cursor.id = 'custom-cursor';
        document.body.appendChild(cursor);

        // Fait suivre la souris au point violet
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        // Agrandit le curseur quand on survole un élément cliquable
        const interactiveElements = document.querySelectorAll('a, button, input, textarea, .flip-card-inner, .book-page, .project-image-lightbox');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
        });
    }

    // ==========================================
    // 2. LOGIQUE PREMIUM : TRANSITIONS DE PAGES
    // ==========================================
    const allLinks = document.querySelectorAll('a[href]');
    
    allLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const target = this.getAttribute('target');
            
            // On ignore les liens qui ouvrent un nouvel onglet, les ancres sur la même page, ou les emails/tel
            if (target === '_blank' || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                return;
            }

            // Pour les liens internes : on bloque le clic direct, on lance l'animation, puis on change de page
            e.preventDefault();
            document.body.classList.add('page-leaving');
            
            setTimeout(() => {
                window.location.href = href;
            }, 400); // 400ms correspond au temps de l'animation CSS (fadeOutPage)
        });
    });

    // Corrige le bug "bouton retour" de Safari/Firefox qui laisse la page en noir
    window.addEventListener('pageshow', function (event) {
        if (event.persisted) {
            document.body.classList.remove('page-leaving');
        }
    });


    // ==========================================
    // 3. CODE EXISTANT (Intro, Blob, Formulaire, etc)
    // ==========================================

    // --- Logique d'Intro (pour index.html et autres) ---
    const preloader = document.getElementById('preloader');

    // Gère le preloader sur TOUTES les pages
    if (preloader) {
        const heroSubtitle = document.getElementById('hero-subtitle');
        const mainTitle = document.getElementById('main-title');

        if (sessionStorage.getItem('hasSeenIntro')) {
            preloader.style.display = 'none';
            if (heroSubtitle && mainTitle) {
                heroSubtitle.classList.add('is-visible');
                mainTitle.classList.add('is-visible');
            }
        } else {
            const introDuration = 2000;
            const slideDuration = 1000;
            const titleDelay = 300;

            setTimeout(() => {
                preloader.classList.add('is-hidden');
                if (heroSubtitle && mainTitle) {
                    setTimeout(() => {
                        heroSubtitle.classList.add('is-visible');
                        mainTitle.classList.add('is-visible');
                    }, titleDelay);
                }
                setTimeout(() => {
                    preloader.style.display = 'none';
                    sessionStorage.setItem('hasSeenIntro', 'true');
                }, slideDuration);
            }, introDuration);
        }
    }

    // --- Logique du titre interactif ---
    const titleElement = document.getElementById('main-title');

    if (titleElement) {
        const titleText = titleElement.textContent;
        const words = titleText.split(' ');

        titleElement.innerHTML = '';

        words.forEach((word, wordIndex) => {
            const wordSpan = document.createElement('span');
            wordSpan.style.display = 'inline-block';

            word.split('').forEach(letter => {
                const span = document.createElement('span');
                span.className = 'letter';
                span.textContent = letter;
                wordSpan.appendChild(span);
            });

            titleElement.appendChild(wordSpan);

            if (wordIndex < words.length - 1) {
                const spaceSpan = document.createElement('span');
                spaceSpan.innerHTML = '&nbsp;';
                spaceSpan.style.minWidth = '0.5em';
                titleElement.appendChild(spaceSpan);
            }
        });
    }

    // --- Logique du "Blob" interactif ---
    const blob = document.getElementById('hero-blob');
    if (blob) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let blobX = mouseX;
        let blobY = mouseY;
        const blobHalfSize = blob.offsetWidth / 2;

        document.body.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateBlob() {
            blobX += (mouseX - blobX) * 0.08;
            blobY += (mouseY - blobY) * 0.08;
            blob.style.transform = `translate(${blobX - blobHalfSize}px, ${blobY - blobHalfSize}px)`;
            requestAnimationFrame(animateBlob);
        }
        animateBlob();
    }

    // --- Logique du formulaire de contact ---
    const contactForm = document.getElementById('contact-form');
    const subjectButtons = document.querySelectorAll('.subject-option');
    const subjectInput = document.getElementById('subject-hidden');

    if (contactForm) {
        if (subjectButtons.length > 0 && subjectInput) {
            subjectButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const subject = button.getAttribute('data-value');
                    subjectInput.value = subject;
                    subjectButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                });
            });
        }

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const successMessage = document.getElementById('success-message');
            const validationMessage = document.getElementById('validation-message');
            const submitButton = contactForm.querySelector('button[type="submit"]');

            if (!contactForm.checkValidity()) {
                if (validationMessage) validationMessage.style.display = 'block';
                const inputs = contactForm.querySelectorAll('input[required], textarea[required]');
                inputs.forEach(input => {
                    if (!input.validity.valid) {
                        input.style.borderColor = '#d9534f';
                    } else {
                        input.style.borderColor = '';
                    }
                    input.addEventListener('input', () => {
                        input.style.borderColor = '';
                        if (validationMessage) validationMessage.style.display = 'none';
                    }, { once: true });
                });
                return;
            }

            if (validationMessage) validationMessage.style.display = 'none';

            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Envoi en cours...';

            const formData = new FormData(contactForm);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: json
            })
            .then(async (response) => {
                if (response.status == 200) {
                    contactForm.style.display = 'none';
                    if (successMessage) {
                        successMessage.textContent = 'Merci ! Votre message a bien été envoyé. Je reviens vers vous très rapidement.';
                        successMessage.style.backgroundColor = '#e6f9e6';
                        successMessage.style.borderColor = '#b3e6b3';
                        successMessage.style.color = '#336633';
                        successMessage.style.display = 'block';
                    }
                } else {
                    if (successMessage) {
                        successMessage.textContent = 'Une erreur serveur est survenue. Veuillez réessayer.';
                        successMessage.style.backgroundColor = '#f9e6e6';
                        successMessage.style.borderColor = '#e6b3b3';
                        successMessage.style.color = '#663333';
                        successMessage.style.display = 'block';
                    }
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }
            })
            .catch(error => {
                console.error("Erreur :", error);
                if (successMessage) {
                    successMessage.textContent = 'Une erreur de connexion est survenue.';
                    successMessage.style.display = 'block';
                }
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            })
            .finally(() => {
                contactForm.reset();
                if (subjectButtons.length > 0) subjectButtons.forEach(btn => btn.classList.remove('active'));
                if (subjectInput) subjectInput.value = '';
            });
        });
    }

    // --- Logique du Flyer Rotatif ---
    const flipCard = document.getElementById('flyer-flip-card');
    if (flipCard) flipCard.addEventListener('click', () => flipCard.classList.toggle('is-flipped'));

    // --- Logique de la Lightbox ---
    const lightbox = document.getElementById('lightbox');

    if (lightbox) {
        const lightboxImg = document.getElementById('lightbox-img');
        const closeBtn = document.querySelector('.lightbox-close');

        const galleryItems = document.querySelectorAll('.creation-gallery .creation-item');
        const projectImageLinks = document.querySelectorAll('.project-image-lightbox');
        const allLightboxLinks = [...galleryItems, ...projectImageLinks];

        const closeLightbox = () => {
            lightbox.style.display = 'none';
            lightboxImg.setAttribute('src', '');
            lightbox.classList.remove('zoomed-in');
        };

        allLightboxLinks.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                let imgSrc = (item.tagName === 'A') ? item.getAttribute('href') : item.querySelector('img')?.getAttribute('src');
                if (imgSrc) {
                    lightboxImg.setAttribute('src', imgSrc);
                    lightbox.style.display = 'flex';
                }
            });
        });

        lightboxImg.addEventListener('click', (e) => {
            e.stopPropagation();
            lightbox.classList.toggle('zoomed-in');
        });

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lightbox.style.display !== 'none') closeLightbox(); });
    }

    // --- Logique du Flipbook 3D (Livre) ---
    const bookContainer = document.getElementById('mon-flipbook');
    
    if (bookContainer && typeof St !== 'undefined') {
        bookContainer.style.boxShadow = 'none';
        bookContainer.style.background = 'transparent';

        const pageFlip = new St.PageFlip(bookContainer, {
            width: 888, 
            height: 630, 
            size: "stretch", 
            minWidth: 444,   
            maxWidth: 1332,
            minHeight: 315,
            maxHeight: 945,
            drawShadow: true, 
            showCover: true, 
            mobileScrollSupport: false, 
            maxShadowOpacity: 0.5,
        });
        pageFlip.loadFromHTML(document.querySelectorAll('.page'));
    }

    // --- Logique de l'animation au scroll ---
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    elementsToAnimate.forEach(element => observer.observe(element));

}); // Fin du DOMContentLoaded