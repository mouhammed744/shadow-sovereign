import { useState, useCallback } from 'react';
import jsPDF from 'jspdf';

/* ─── Génération du PDF ─────────────────────────────────────────────────── */
function generateCandidaturePDF(formData: FormData): File {
  const doc = new jsPDF();
  const pseudo = (formData.get('pseudo') as string) || 'Inconnu';

  doc.setFillColor(106, 13, 173);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SHADOW SOVEREIGN — CANDIDATURE', 105, 12, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Call of Duty Mobile  •  Clan 2S •', 105, 22, { align: 'center' });

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

  doc.setDrawColor(106, 13, 173);
  doc.line(15, y + 5, 195, y + 5);
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Document généré automatiquement — Shadow Sovereign Clan © 2026', 105, y + 12, { align: 'center' });

  const blob = doc.output('blob');
  return new File([blob], `candidature-${pseudo}.pdf`, { type: 'application/pdf' });
}

/* ─── Construction du HTML de l'email ──────────────────────────────────── */
function buildEmailHtml(params: {
  time: string;
  player_name: string;
  player_type: string;
  experience: string;
  q1: string; q2: string; q3: string; q4: string; q5: string;
  profile_pic_html: string;
}): string {
  return `
<div style="font-family: Arial, sans-serif; font-size: 14px; background-color: #0a0a0a; color: #ffffff; padding: 20px; border: 2px solid #ffcc00; border-radius: 10px;">

  <div style="text-align: center; margin-bottom: 20px;">
    <h2 style="color: #ffcc00; text-transform: uppercase;">⚡ Nouvelle Recrue Shadow Sovereign ⚡</h2>
    <div style="font-size: 12px; color: #aaaaaa;">Candidature reçue le ${params.time}</div>
  </div>

  <div style="padding: 15px; border-top: 1px dashed #ffcc00; border-bottom: 1px dashed #ffcc00;">
    <table role="presentation" style="width: 100%;">
      <tr>
        <td style="vertical-align: top; width: 60px;">
          <div style="padding: 10px; background-color: #1a1a1a; border-radius: 50%; font-size: 30px; text-align: center; border: 1px solid #ffcc00;">
            👤
          </div>
        </td>
        <td style="vertical-align: top; padding-left: 15px;">
          <div style="color: #ffcc00; font-size: 18px; font-weight: bold; margin-bottom: 10px;">
            SOLDAT : ${params.player_name}
          </div>
          <p style="margin: 5px 0;"><strong>Type de joueur :</strong> ${params.player_type}</p>
          <p style="margin: 5px 0;"><strong>Expérience :</strong> ${params.experience}</p>
          <div style="margin-top: 15px; background: #1a1a1a; padding: 10px; border-radius: 5px;">
            <strong style="color: #ffcc00;">RÉPONSES RAPIDES :</strong><br>
            • Régulier : ${params.q1}<br>
            • Respectueux : ${params.q2}<br>
            • Actif Guerre de Clan : ${params.q3}<br>
            • Accepte le règlement : ${params.q4}<br>
            • Représente avec honneur : ${params.q5}
          </div>
        </td>
      </tr>
    </table>
  </div>

  <div style="margin-top: 20px; text-align: center;">
    <p style="color: #ffcc00; font-weight: bold; margin-bottom: 10px;">📸 Capture d'écran du profil :</p>
    <div style="display: inline-block; border: 2px solid #ffcc00; border-radius: 8px; overflow: hidden;">
      ${params.profile_pic_html}
    </div>
  </div>

  <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #ffcc00;">
    <p style="color: #555;">2S • Family — On avance ensemble.</p>
  </div>

</div>`;
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

    if (!pseudo)     errs.push('Le pseudo est obligatoire.');
    if (!playerType) errs.push('Veuillez sélectionner un type de joueur.');

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
      const pseudo      = (formData.get('pseudo')       as string) || '';
      const playerType  = (formData.get('player_type')  as string) || '—';
      const experience  = (formData.get('experience')   as string) || 'Aucune';
      const q1 = (formData.get('q1') as string) || '—';
      const q2 = (formData.get('q2') as string) || '—';
      const q3 = (formData.get('q3') as string) || '—';
      const q4 = (formData.get('q4') as string) || '—';
      const q5 = (formData.get('q5') as string) || '—';
      const time = new Date().toLocaleString('fr-FR');

      // 1. Convertir la capture en base64
      const profilePic = formData.get('profile_pic') as File;
      let profilePicHtml = '<em style="color:#aaa;">Aucune capture fournie</em>';
      if (profilePic && profilePic.size > 0) {
        const base64 = await readFileAsBase64(profilePic);
        profilePicHtml = `<img src="${base64}" alt="Profil de ${pseudo}" style="max-width:480px;display:block;" />`;
      }

      // 2. Générer le PDF et le télécharger automatiquement
      const pdfFile = generateCandidaturePDF(formData);
      downloadFile(pdfFile);

      // 3. Construire le HTML de l'email et envoyer
      const message_html = buildEmailHtml({
        time, player_name: pseudo, player_type: playerType,
        experience, q1, q2, q3, q4, q5, profile_pic_html: profilePicHtml,
      });

      // @ts-ignore
      await emailjs.send('service_uam8eqa', 'template_c5enofb', {
        player_name:  pseudo,
        time,
        message_html,   // ← tout le HTML de l'email ici
      });

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
