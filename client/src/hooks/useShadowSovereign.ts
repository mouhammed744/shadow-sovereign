import { useState, useCallback } from 'react';
import jsPDF from 'jspdf';

/* ─── Génération du PDF ─────────────────────────────────────────────────── */
function generateCandidaturePDF(formData: FormData): File {
  const doc = new jsPDF();
  const pseudo = (formData.get('pseudo') as string) || 'Inconnu';

  // En-tête violet
  doc.setFillColor(106, 13, 173);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SHADOW SOVEREIGN — CANDIDATURE', 105, 12, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Call of Duty Mobile  •  Clan 2S •', 105, 22, { align: 'center' });

  // Tableau des données
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
    if (i % 2 === 0) {
      doc.setFillColor(245, 240, 255);
      doc.rect(15, y - 5, 180, 12, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 0, 120);
    doc.text(label, 18, y + 3);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    const lines = doc.splitTextToSize(value, 75);
    doc.text(lines, 110, y + 3);
    y += 14;
  });

  // Pied de page
  doc.setDrawColor(106, 13, 173);
  doc.line(15, y + 5, 195, y + 5);
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Document généré automatiquement — Shadow Sovereign Clan © 2026', 105, y + 12, { align: 'center' });

  const blob = doc.output('blob');
  return new File([blob], `candidature-${pseudo}.pdf`, { type: 'application/pdf' });
}

/* ─── Lecture image en base64 ───────────────────────────────────────────── */
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ─── Téléchargement automatique du PDF ─────────────────────────────────── */
function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ─── Hook principal ────────────────────────────────────────────────────── */
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
    const errs: string[] = [];
    const pseudo = formData.get('pseudo')?.toString().trim();
    const playerType = formData.get('player_type');
    const profilePic = formData.get('profile_pic') as File;

    if (!pseudo)      errs.push('Le pseudo est obligatoire.');
    if (!playerType)  errs.push('Veuillez sélectionner un type de joueur.');

    if (!profilePic || !profilePic.name) {
      errs.push("Veuillez ajouter une capture d'écran de votre profil.");
    } else {
      if (!profilePic.type.startsWith('image/')) errs.push('Le fichier doit être une image.');
      if (profilePic.size > 5 * 1024 * 1024)    errs.push("L'image ne doit pas dépasser 5 MB.");
    }

    if (!formData.get('q1')) errs.push('Veuillez répondre à la question 1.');
    if (!formData.get('q2')) errs.push('Veuillez répondre à la question 2.');
    if (!formData.get('q3')) errs.push('Veuillez répondre à la question 3 (obligatoire).');
    if (!formData.get('q4')) errs.push('Veuillez répondre à la question 4.');
    if (!formData.get('q5')) errs.push('Veuillez répondre à la question 5.');

    if (formData.get('q3') && formData.get('q3') !== 'oui') {
      errs.push('Les activités du clan sont obligatoires pour rejoindre 2S.');
    }

    return errs;
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
      const pseudo = formData.get('pseudo') as string;

      // 1. Convertir la capture en base64 pour l'intégrer dans l'email
      const profilePic = formData.get('profile_pic') as File;
      let profilePicHtml = '<em>Aucune capture fournie</em>';
      if (profilePic && profilePic.size > 0) {
        const base64 = await readFileAsBase64(profilePic);
        profilePicHtml = `<img src="${base64}" alt="Profil de ${pseudo}" style="max-width:480px;border:3px solid #6a0dad;border-radius:8px;" />`;
      }

      // 2. Générer le PDF et le télécharger automatiquement
      const pdfFile = generateCandidaturePDF(formData);
      downloadFile(pdfFile);

      // 3. Envoyer l'email avec l'image intégrée
      const templateParams = {
        player_name:      pseudo,
        player_type:      formData.get('player_type'),
        experience:       formData.get('experience') || 'Aucune',
        q1:               formData.get('q1'),
        q2:               formData.get('q2'),
        q3:               formData.get('q3'),
        q4:               formData.get('q4'),
        q5:               formData.get('q5'),
        time:             new Date().toLocaleString('fr-FR'),
        profile_pic_html: profilePicHtml,   // image inline dans l'email
      };

      // @ts-ignore
      await emailjs.send('service_uam8eqa', 'template_c5enofb', templateParams);

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
    setErrors,
  };
}
