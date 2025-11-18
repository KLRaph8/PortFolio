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


    // --- Logique du formulaire de contact (CORRIGÉ) ---
    // CORRECTION: Cible le bon ID de formulaire
    const contactForm = document.getElementById('contact-form-netlify');
    // CORRECTION: Cible la bonne classe de boutons
    const subjectButtons = document.querySelectorAll('.subject-option');
    // CORRECTION: Cible le bon ID de champ
    const subjectInput = document.getElementById('subject-hidden');
    
    if (contactForm && subjectButtons.length > 0 && subjectInput) {
        
        // 1. Logique des boutons de sujet
        subjectButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault(); 
                // CORRECTION: Utilise data-value comme dans le HTML
                const subject = button.getAttribute('data-value');
                
                subjectInput.value = subject;
                
                subjectButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });

        // 2. Logique d'envoi AJAX Netlify
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // CORRECTION: Cible le message de succès HORS du formulaire
            const successMessage = document.getElementById('success-message');
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;

            submitButton.disabled = true;
            submitButton.textContent = 'Envoi en cours...';
            
            // Cache le formulaire et montre le message
            if(successMessage) {
                successMessage.style.display = 'none';
                successMessage.style.backgroundColor = '#e6f9e6';
                successMessage.style.borderColor = '#b3e6b3';
                successMessage.style.color = '#336633';
            }


            const formData = new FormData(contactForm);
            const encodedData = new URLSearchParams(formData).toString();

            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: encodedData
            })
            .then(() => {
                if (successMessage) {
                    // Cache le formulaire
                    contactForm.style.display = 'none';
                    // Affiche le message de succès
                    successMessage.textContent = 'Merci ! Votre message a bien été envoyé. Je reviens vers vous très rapidement.';
                    successMessage.style.display = 'block';
                }
                // Pas besoin de reset le form s'il est caché
            })
            .catch((error) => {
                console.error("Erreur d'envoi à Netlify:", error);
                if (successMessage) {
                    // Affiche un message d'erreur DANS la div succès
                    successMessage.textContent = 'Une erreur est survenue. Veuillez réessayer.';
                    successMessage.style.backgroundColor = '#f9e6e6'; // Erreur en rouge
                    successMessage.style.borderColor = '#e6b3b3';
                    successMessage.style.color = '#663333';
                    successMessage.style.display = 'block';
                }
                // Ré-active le bouton en cas d'erreur pour que l'utilisateur puisse réessayer
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            });
            // Note: Le .finally() est retiré pour que le bouton reste "envoi"
            // jusqu'à ce que le message de succès/erreur s'affiche.
            // Le formulaire ne se réinitialise que s'il y a succès.
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
                if(item.tagName === 'A') {
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


    // --- Logique de l'animation au scroll ---
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Ne l'anime qu'une fois
            }
        });
    }, {
        threshold: 0.1 
    });

    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });

}); // Fin du DOMContentLoaded