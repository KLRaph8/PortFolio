// Attend que le DOM soit entièrement chargé
document.addEventListener('DOMContentLoaded', () => {

    // --- Logique d'Intro (pour index.html et autres) ---
    const preloader = document.getElementById('preloader');

    // Gère le preloader sur TOUTES les pages
    if (preloader) {
        const heroSubtitle = document.getElementById('hero-subtitle');
        const mainTitle = document.getElementById('main-title');

        if (sessionStorage.getItem('hasSeenIntro')) {
            // Si l'intro a déjà été vue, on cache le preloader direct
            preloader.style.display = 'none';

            // Et on affiche les titres de la page d'accueil (si on est dessus)
            if (heroSubtitle && mainTitle) {
                heroSubtitle.classList.add('is-visible');
                mainTitle.classList.add('is-visible');
            }
        } else {
            // C'est la première visite de la session
            const introDuration = 2000;
            const slideDuration = 1000;
            const titleDelay = 300;

            setTimeout(() => {
                preloader.classList.add('is-hidden');

                // Affiche les titres (si on est sur l'accueil)
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

    // --- Logique du titre interactif (pour index.html et a-propos.html) ---
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
    // --- Fin de la logique du titre ---


    // --- Logique du "Blob" interactif (sur l'accueil) ---
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
    // --- Fin de la logique du "Blob" ---


    // --- Logique du formulaire de contact ---
    const contactForm = document.getElementById('contact-form');
    const subjectButtons = document.querySelectorAll('.subject-option');
    const subjectInput = document.getElementById('subject-hidden');

    if (contactForm) {

        // 1. Logique des boutons de sujet
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

        // 2. Logique d'envoi et validation personnalisée
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const successMessage = document.getElementById('success-message');
            const validationMessage = document.getElementById('validation-message');
            const submitButton = contactForm.querySelector('button[type="submit"]');

            // --- NOUVEAU : Validation manuelle des champs ---
            if (!contactForm.checkValidity()) {
                // Affiche le message d'erreur général
                if (validationMessage) validationMessage.style.display = 'block';

                // Cible tous les champs obligatoires pour mettre en surbrillance ceux qui sont vides
                const inputs = contactForm.querySelectorAll('input[required], textarea[required]');
                inputs.forEach(input => {
                    if (!input.validity.valid) {
                        input.style.borderColor = '#d9534f'; // Rouge
                    } else {
                        input.style.borderColor = ''; // Réinitialise si valide
                    }

                    // Dès que l'utilisateur tape quelque chose, on retire la bordure rouge et le message
                    input.addEventListener('input', () => {
                        input.style.borderColor = '';
                        if (validationMessage) validationMessage.style.display = 'none';
                    }, { once: true });
                });

                return; // Stoppe la fonction ici, on n'envoie rien !
            }

            // Si tout est valide, on s'assure que le message d'erreur est bien caché
            if (validationMessage) validationMessage.style.display = 'none';

            // --- Suite normale de l'envoi AJAX ---
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Envoi en cours...';

            const formData = new FormData(contactForm);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
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
                    console.error("Erreur de connexion :", error);
                    if (successMessage) {
                        successMessage.textContent = 'Une erreur de connexion est survenue. Veuillez vérifier votre internet.';
                        successMessage.style.backgroundColor = '#f9e6e6';
                        successMessage.style.borderColor = '#e6b3b3';
                        successMessage.style.color = '#663333';
                        successMessage.style.display = 'block';
                    }
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                })
                .finally(() => {
                    contactForm.reset();
                    if (subjectButtons.length > 0) {
                        subjectButtons.forEach(btn => btn.classList.remove('active'));
                    }
                    if (subjectInput) subjectInput.value = '';
                });
        });
    }
    // --- Fin de la logique du formulaire ---


    // --- Logique du Flyer Rotatif ---
    const flipCard = document.getElementById('flyer-flip-card');
    if (flipCard) {
        flipCard.addEventListener('click', () => {
            flipCard.classList.toggle('is-flipped');
        });
    }

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

                let imgSrc;
                if (item.tagName === 'A') {
                    imgSrc = item.getAttribute('href');
                } else {
                    const img = item.querySelector('img');
                    if (img) imgSrc = img.getAttribute('src');
                }

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

        if (closeBtn) {
            closeBtn.addEventListener('click', closeLightbox);
        }

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.style.display !== 'none') {
                closeLightbox();
            }
        });
    }
    // --- Fin de la Logique Lightbox ---


    // --- Logique du Flipbook 3D (Livre) ---
    const bookContainer = document.getElementById('mon-flipbook');
    
    if (bookContainer && typeof St !== 'undefined') {
        
        // CORRECTION : On retire l'ombre globale qui colorait le "vide" en blanc.
        // La librairie s'occupera d'ajouter des ombres uniquement sur les pages !
        bookContainer.style.boxShadow = 'none';
        bookContainer.style.background = 'transparent';

        // Initialisation de la librairie PageFlip
        const pageFlip = new St.PageFlip(bookContainer, {
            // Dimensions exactes du ratio A6 horizontal (148mm x 105mm)
            width: 888,  // 148 * 6
            height: 630, // 105 * 6
            size: "stretch", // Le livre s'adapte à l'écran
            minWidth: 444,   // Limites adaptées au même ratio
            maxWidth: 1332,
            minHeight: 315,
            maxHeight: 945,
            drawShadow: true, // Active les ombres 3D internes
            
            // On GARDE showCover sur "true". 
            // Si on le met sur "false", ta couverture sera à gauche et la page 2 à droite, 
            // ce qui va complètement décaler tes doubles-pages intérieures !
            showCover: true, 
            
            mobileScrollSupport: false, // Permet le "swipe" manuel sur mobile
            maxShadowOpacity: 0.5,
        });

        // Charge les éléments HTML
        pageFlip.loadFromHTML(document.querySelectorAll('.page'));
    }
    // --- Fin de la Logique Flipbook ---

    // --- Logique de l'animation au scroll ---
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });

}); // Fin du DOMContentLoaded