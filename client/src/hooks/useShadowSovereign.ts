import { useState, useCallback } from 'react';
import jsPDF from 'jspdf';

function generateCandidaturePDF(formData: FormData): File {
  const doc = new jsPDF();
  const pseudo = (formData.get('pseudo') as string) || 'Inconnu';

  // --- En-tête violet ---
  doc.setFillColor(106, 13, 173);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SHADOW SOVEREIGN — CANDIDATURE', 105, 12, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Call of Duty Mobile • Clan 2S •', 105, 22, { align: 'center' });

  // --- Infos ---
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);

  const rows: [string, string][] = [
    ['Date de soumission', new Date().toLocaleString('fr-FR')],
    ['Pseudo (IGN)', pseudo],
    ['Type de joueur', (formData.get('player_type') as string) || '—'],
    ['Expérience / Anciens clans', (formData.get('experience') as string) || 'Aucune'],
    ['Q1 — Joue régulièrement ?', (formData.get('q1') as string) || '—'],
    ['Q2 — Respecte les règles ?', (formData.get('q2') as string) || '—'],
    ['Q3 — Actif pour les événements ?', (formData.get('q3') as string) || '—'],
    ['Q4 — Accepte le règlement ?', (formData.get('q4') as string) || '—'],
    ['Q5 — Représente avec honneur ?', (formData.get('q5') as string) || '—'],
  ];

  let y = 40;
  rows.forEach(([label, value], i) => {
    // Alternance de fond
    if (i % 2 === 0) {
      doc.setFillColor(245, 240, 255);
      doc.rect(15, y - 5, 180, 12, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 0, 120);
    doc.text(label, 18, y + 3);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(value, 110, y + 3);
    y += 14;
  });

  // --- Pied de page ---
  doc.setDrawColor(106, 13, 173);
  doc.line(15, y + 5, 195, y + 5);
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Document généré automatiquement — Shadow Sovereign Clan © 2026', 105, y + 12, { align: 'center' });

  const blob = doc.output('blob');
  return new File([blob], `candidature-${pseudo}.pdf`, { type: 'application/pdf' });
}

export function useShadowSovereign() {
  const [currentPage, setCurrentPage] = useState('home');
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const switchPage = useCallback((targetId: string) => {
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

    if (!pseudo) errors.push('Le pseudo est obligatoire.');
    if (!playerType) errors.push('Veuillez sélectionner un type de joueur.');

    if (!profilePic || !profilePic.name) {
      errors.push("Veuillez ajouter une capture d'écran de votre profil.");
    } else {
      if (!profilePic.type.startsWith('image/')) errors.push('Le fichier doit être une image.');
      if (profilePic.size > 5 * 1024 * 1024) errors.push("L'image ne doit pas dépasser 5MB.");
    }

    if (!formData.get('q1')) errors.push('Veuillez répondre à la question 1.');
    if (!formData.get('q2')) errors.push('Veuillez répondre à la question 2.');
    if (!formData.get('q3')) errors.push('Veuillez répondre à la question 3 (obligatoire).');
    if (!formData.get('q4')) errors.push('Veuillez répondre à la question 4.');
    if (!formData.get('q5')) errors.push('Veuillez répondre à la question 5.');

    if (formData.get('q3') && formData.get('q3') !== 'oui') {
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
      // 1. Générer le PDF et l'injecter dans l'input caché
      const pdfFile = generateCandidaturePDF(formData);
      const pdfInput = document.getElementById('pdf-attachment') as HTMLInputElement;
      if (pdfInput && typeof DataTransfer !== 'undefined') {
        const dt = new DataTransfer();
        dt.items.add(pdfFile);
        pdfInput.files = dt.files;
      }

      // 2. Envoyer via sendForm (capture + PDF inclus automatiquement)
      // @ts-ignore
      await emailjs.sendForm(
        'service_uam8eqa',
        'template_c5enofb',
        form
      );

      console.log('✅ Candidature envoyée avec succès !');
      form.reset();
      setCurrentPage('success');
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi :", error);
      setErrors(["Erreur lors de l'envoi de la candidature. Veuillez réessayer."]);
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
