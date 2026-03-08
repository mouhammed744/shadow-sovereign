import { useState, useCallback } from 'react';

export function useShadowSovereign() {
  const [currentPage, setCurrentPage] = useState('home');
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const switchPage = useCallback((targetId: string) => {
    // Vérifier si l'utilisateur essaie d'accéder au formulaire sans avoir lu les règles
    if (targetId === 'join' && !rulesAccepted) {
      setCurrentPage('rules-page');
      return;
    }
    setCurrentPage(targetId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [rulesAccepted]);

  const acceptRules = useCallback(() => {
    setRulesAccepted(true);
    setCurrentPage('join');
  }, []);

  const validateForm = useCallback((formData: FormData) => {
    const errors: string[] = [];

    const pseudo = formData.get('pseudo')?.toString().trim();
    const playerType = formData.get('player_type');
    const profilePic = formData.get('profile_pic') as File;

    if (!pseudo) {
      errors.push('Le pseudo est obligatoire.');
    }

    if (!playerType) {
      errors.push('Veuillez sélectionner un type de joueur.');
    }

    if (!profilePic || !profilePic.name) {
      errors.push('Veuillez ajouter une capture d\'écran de votre profil.');
    } else {
      if (!profilePic.type.startsWith('image/')) {
        errors.push('Le fichier doit être une image.');
      }
      if (profilePic.size > 5 * 1024 * 1024) {
        errors.push('L\'image ne doit pas dépasser 5MB.');
      }
    }

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

    if (q3 && q3 !== 'oui') {
      errors.push('Les activités du clan sont obligatoires pour rejoindre 2S.');
    }

    return errors;
  }, []);

  const handleFormSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    const validationErrors = validateForm(formData);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);

    try {
      const templateParams = {
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

      // @ts-ignore
      await emailjs.send(
        "service_uam8eqa",
        "template_c5enofb",
        templateParams
      );

      console.log("✅ Candidature envoyée avec succès !");
      form.reset();
      setCurrentPage('success');
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi :', error);
      setErrors(['Erreur lors de l\'envoi de la candidature. Veuillez réessayer.']);
    }
  }, [validateForm]);

  return {
    currentPage,
    rulesAccepted,
    mobileMenuOpen,
    errors,
    switchPage,
    acceptRules,
    handleFormSubmit,
    setMobileMenuOpen,
    setErrors
  };
}
