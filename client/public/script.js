/**
 * Shadow Sovereign - Site de Recrutement
 * Script amélioré avec meilleure structure, gestion d'erreurs et flux utilisateur
 * 
 * Améliorations :
 * - Séparation des responsabilités (navigation, formulaire, règles)
 * - Gestion d'erreurs robuste
 * - Validation complète du formulaire
 * - Flux obligatoire : Règles → Candidature
 * - Meilleure accessibilité et UX
 */

class ShadowSovereignApp {
    constructor() {
        this.currentPage = 'home';
        this.rulesAccepted = false;
        this.init();
    }

    /**
     * Initialise l'application
     */
    init() {
        this.cacheElements();
        this.attachEventListeners();
        this.logInitialization();
    }

    /**
     * Met en cache les éléments DOM pour éviter les requêtes répétées
     */
    cacheElements() {
        this.navLinks = document.querySelectorAll('.nav-links a, .nav-trigger');
        this.pages = document.querySelectorAll('.page');
        this.burger = document.querySelector('.burger-menu');
        this.nav = document.querySelector('.nav-links');
        this.form = document.getElementById('recruitment-form');
        this.errorMsg = document.getElementById('error-message');
    }

    /**
     * Attache les écouteurs d'événements
     */
    attachEventListeners() {
        // Menu burger
        if (this.burger) {
            this.burger.addEventListener('click', () => this.toggleMobileMenu());
            this.burger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleMobileMenu();
                }
            });
        }

        // Liens de navigation
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e, link));
        });

        // Formulaire de recrutement
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Bouton d'acceptation du règlement
        const rulesAcceptBtn = document.getElementById('accept-rules-btn');
        if (rulesAcceptBtn) {
            rulesAcceptBtn.addEventListener('click', (e) => this.acceptRules(e));
        }
    }

    /**
     * Bascule le menu mobile
     */
    toggleMobileMenu() {
        const isActive = this.nav.classList.toggle('nav-active');
        const icon = this.burger.querySelector('i');
        
        if (isActive) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }

    /**
     * Ferme le menu mobile
     */
    closeMobileMenu() {
        this.nav.classList.remove('nav-active');
        const icon = this.burger.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }

    /**
     * Gère la navigation entre les pages
     */
    handleNavigation(e, link) {
        e.preventDefault();
        const targetId = link.getAttribute('data-target');

        // Vérifier si l'utilisateur essaie d'accéder au formulaire sans avoir lu les règles
        if (targetId === 'join' && !this.rulesAccepted) {
            this.switchPage('rules-page');
            this.showNotification('Veuillez d\'abord lire et accepter le règlement du clan.', 'warning');
            return;
        }

        this.switchPage(targetId);
        this.closeMobileMenu();
    }

    /**
     * Change de page avec animation
     */
    switchPage(targetId) {
        // Masquer toutes les pages
        this.pages.forEach(page => {
            page.classList.remove('active');
            page.style.display = 'none';
        });

        // Afficher la page cible
        const targetPage = document.getElementById(targetId);
        if (!targetPage) {
            console.error(`Page avec l'ID "${targetId}" non trouvée`);
            return;
        }

        targetPage.style.display = 'block';
        // Délai pour permettre à CSS de détecter le changement display
        setTimeout(() => targetPage.classList.add('active'), 50);

        // Scroll vers le haut
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Mettre à jour les liens actifs
        this.updateActiveLinks(targetId);
        this.currentPage = targetId;
    }

    /**
     * Met à jour les liens de navigation actifs
     */
    updateActiveLinks(targetId) {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-target') === targetId) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Accepte le règlement et active l'accès au formulaire
     */
    acceptRules(e) {
        e.preventDefault();
        this.rulesAccepted = true;
        this.showNotification('Règlement accepté ! Vous pouvez maintenant soumettre votre candidature.', 'success');
        this.switchPage('join');
    }

    /**
     * Valide le formulaire
     */
    validateForm(formData) {
        const errors = [];

        // Vérifier les champs obligatoires
        const pseudo = formData.get('pseudo')?.trim();
        const playerType = formData.get('player_type');
        const profilePic = formData.get('profile_pic');

        if (!pseudo) {
            errors.push('Le pseudo est obligatoire.');
        }

        if (!playerType) {
            errors.push('Veuillez sélectionner un type de joueur.');
        }

        if (!profilePic || !profilePic.name) {
            errors.push('Veuillez ajouter une capture d\'écran de votre profil.');
        } else {
            // Vérifier que c'est une image
            if (!profilePic.type.startsWith('image/')) {
                errors.push('Le fichier doit être une image.');
            }
            // Vérifier la taille (max 5MB)
            if (profilePic.size > 5 * 1024 * 1024) {
                errors.push('L\'image ne doit pas dépasser 5MB.');
            }
        }

        // Vérifier les questions obligatoires
        const q1 = formData.get('q1');
        const q2 = formData.get('q2');
        const q3 = formData.get('q3');
        const q4 = formData.get('q4');
        const q5 = formData.get('q5');

        if (!q1) errors.push('Veuillez répondre à la question 1.');
        if (!q2) errors.push('Veuillez répondre à la question 2.');
        if (!q3) errors.push('Veuillez répondre à la question 3 (obligatoire).');
        if (!q4) errors.push('Veuillez répondre à la question 4.');
        if (!q5) errors.push('Veuillez répondre à la question 5.');

        // Vérifier que q3 (activité clan) est "oui"
        if (q3 && q3 !== 'oui') {
            errors.push('Les activités du clan sont obligatoires pour rejoindre 2S.');
        }

        return errors;
    }

    /**
     * Affiche les erreurs de validation
     */
    displayErrors(errors) {
        if (errors.length === 0) {
            this.errorMsg.classList.add('hidden');
            return;
        }

        const errorHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <div>${errors.join('<br>')}</div>
        `;
        this.errorMsg.innerHTML = errorHTML;
        this.errorMsg.classList.remove('hidden');
    }

    /**
     * Prépare les données du formulaire pour EmailJS
     */
    prepareEmailData(formData) {
        return {
            player_name: formData.get('pseudo'),
            player_type: formData.get('player_type'),
            experience: formData.get('experience') || 'Aucune',
            q1: formData.get('q1'),
            q2: formData.get('q2'),
            q3: formData.get('q3'),
            q4: formData.get('q4'),
            q5: formData.get('q5'),
            time: new Date().toLocaleString('fr-FR')
        };
    }

    /**
     * Gère la soumission du formulaire
     */
    async handleFormSubmit(e) {
        e.preventDefault();

        const formData = new FormData(this.form);
        const errors = this.validateForm(formData);

        // S'il y a des erreurs, les afficher et arrêter
        if (errors.length > 0) {
            this.displayErrors(errors);
            return;
        }

        // Masquer les erreurs si tout est valide
        this.errorMsg.classList.add('hidden');

        try {
            // Préparer les données
            const templateParams = this.prepareEmailData(formData);

            // Envoyer l'email via EmailJS
            await emailjs.send(
                "2c4foe1kPxi-A4hAQ",
                "template_c5enofb",
                templateParams
            );

            console.log("✅ Candidature envoyée avec succès !");
            this.showNotification('Candidature envoyée avec succès !', 'success');
            
            // Réinitialiser le formulaire
            this.form.reset();
            
            // Aller à la page de succès après un délai
            setTimeout(() => {
                this.switchPage('success');
            }, 500);

        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi :', error);
            this.displayErrors(['Erreur lors de l\'envoi de la candidature. Veuillez réessayer.']);
        }
    }

    /**
     * Affiche une notification temporaire
     */
    showNotification(message, type = 'info') {
        // Créer un élément de notification s'il n'existe pas
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                background: ${type === 'success' ? '#4ade80' : type === 'warning' ? '#fbbf24' : '#60a5fa'};
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                z-index: 2000;
                max-width: 300px;
                animation: slideInRight 0.3s ease;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            `;
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.style.background = type === 'success' ? '#4ade80' : type === 'warning' ? '#fbbf24' : '#60a5fa';
        notification.style.display = 'block';

        // Masquer après 4 secondes
        setTimeout(() => {
            notification.style.display = 'none';
        }, 4000);
    }

    /**
     * Log l'initialisation (pour debug)
     */
    logInitialization() {
        console.log('🚀 Shadow Sovereign App initialisée');
        console.log('📍 Pages trouvées:', this.pages.length);
        console.log('🔗 Liens de navigation:', this.navLinks.length);
    }
}

// Initialiser l'application quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    new ShadowSovereignApp();
});
