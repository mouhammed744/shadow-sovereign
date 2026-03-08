import { useEffect } from "react";
import { useShadowSovereign } from "@/hooks/useShadowSovereign";

export default function App() {
  const {
    currentPage,
    rulesAccepted,
    mobileMenuOpen,
    errors,
    switchPage,
    acceptRules,
    handleFormSubmit,
    setMobileMenuOpen,
    setErrors
  } = useShadowSovereign();

  useEffect(() => {
    // Initialize EmailJS
    // @ts-ignore
    if (window.emailjs) {
      // @ts-ignore
      emailjs.init("2c4foe1kPxi-A4hAQ");
    }
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (targetId === 'join' && !rulesAccepted) {
      switchPage('rules-page');
    } else {
      switchPage(targetId);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <img src="shadow.jpg" alt="Logo Shadow Sovereign" id="clan-logo" />
            <span>SHADOW SOVEREIGN</span>
          </div>
          <ul className={`nav-links ${mobileMenuOpen ? 'nav-active' : ''}`} role="navigation">
            <li><a href="#" data-target="home" className={currentPage === 'home' ? 'active' : ''} onClick={(e) => handleNavClick(e, 'home')}>Accueil</a></li>
            <li><a href="#" data-target="about" className={currentPage === 'about' ? 'active' : ''} onClick={(e) => handleNavClick(e, 'about')}>À propos</a></li>
            <li><a href="#" data-target="join" className={`btn-nav ${currentPage === 'join' ? 'active' : ''}`} onClick={(e) => handleNavClick(e, 'join')}>Rejoindre le clan</a></li>
          </ul>
          <div className="burger-menu" aria-label="Menu de navigation" role="button" tabIndex={0} onClick={toggleMobileMenu}>
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </div>
        </div>
      </nav>

      <main>
        {/* --- Accueil --- */}
        <section id="home" className={`page ${currentPage === 'home' ? 'active' : ''}`} style={{ display: currentPage === 'home' ? 'flex' : 'none' }}>
          <div className="hero-overlay"></div>
          <div className="hero-content">
              <h1 className="glitch" data-text="Shadow Sovereign">Shadow Sovereign</h1>
            <div className="hero-logo-circle animate-float">
              <img src="shadow.jpg" alt="Logo Shadow Sovereign" className="hero-logo" />
            </div>
            <h2>Dominez depuis les Ombres</h2>
            <p>Un clan compétitif de Call of Duty Mobile regroupant des joueurs actifs, stratégiques et passionnés.</p>
            <div className="hero-buttons">
              <button className="btn primary" onClick={() => switchPage('rules-page')}>Rejoindre le clan</button>
              <button className="btn secondary" onClick={() => switchPage('about')}>À propos</button>
            </div>
          </div>
        </section>

        {/* --- À propos --- */}
        <section id="about" className={`page ${currentPage === 'about' ? 'active' : ''}`} style={{ display: currentPage === 'about' ? 'block' : 'none' }}>
          <div className="container">
            <h2 className="section-title">Qui sommes-nous ?</h2>
            <div className="about-grid">
              <div className="about-text slide-in-left">
                <p>Nés dans l'ombre, forgés par la compétition. Shadow Sovereign est une fraternité d'élite sur Call of Duty Mobile.</p>
                
                <h3>Notre Mission</h3>
                <ul className="mission-list">
                  <li><i className="fas fa-crosshairs"></i> Construire une communauté forte</li>
                  <li><i className="fas fa-shield-alt"></i> Participer et dominer les guerres de clan</li>
                  <li><i className="fas fa-level-up-alt"></i> Progresser ensemble</li>
                </ul>

                <p>Pour rejoindre le clan, il est obligatoire de respecter nos règles. 
                  <a href="#" onClick={(e) => { e.preventDefault(); switchPage('rules-page'); }}>Lire le règlement</a>
                </p>
              </div>
              <div className="about-image slide-in-right">
                <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Esport Gaming" />
              </div>
            </div>
          </div>
        </section>

        {/* --- Rejoindre le clan --- */}
        <section id="join" className={`page ${currentPage === 'join' ? 'active' : ''}`} style={{ display: currentPage === 'join' ? 'block' : 'none' }}>
          <div className="container">
            <h2 className="section-title">Recrutement Shadow Sovereign</h2>
            <div className="form-container">
              <p className="form-intro">Prouve que tu es digne d'entrer dans l'ombre.</p>
              
              <form id="recruitment-form" encType="multipart/form-data" noValidate onSubmit={handleFormSubmit}>
                <div className="input-group">
                  <label htmlFor="pseudo">Pseudo en jeu (IGN)</label>
                  <input type="text" id="pseudo" name="pseudo" placeholder="Ex: 2S • Ghost" required />
                </div>

                <div className="input-group">
                  <label htmlFor="player_type">Type de joueur</label>
                  <select id="player_type" name="player_type" required>
                    <option value="">-- Choisir --</option>
                    <option value="BR">BR (Battle Royale)</option>
                    <option value="MJ">MJ (Multijoueur)</option>
                    <option value="Polyvalent">Polyvalent (BR & MJ)</option>
                  </select>
                </div>

                <div className="input-group">
                  <label htmlFor="profile_pic">Capture d'écran de ton profil (Preuve de niveau)</label>
                  <input type="file" id="profile_pic" name="profile_pic" accept="image/*" required />
                </div>

                <div className="input-group">
                  <label htmlFor="experience">As-tu déjà été dans un clan ? Si oui, lequel ?</label>
                  <textarea id="experience" name="experience" placeholder="Tes anciens clans, tes motivations..."></textarea>
                </div>

                <div className="question-block">
                  <p>1. Joues-tu régulièrement à Call of Duty Mobile ?</p>
                  <div className="radio-group">
                    <label><input type="radio" name="q1" value="oui" required /> Oui</label>
                    <label><input type="radio" name="q1" value="non" /> Non</label>
                  </div>
                </div>

                <div className="question-block">
                  <p>2. Te conformeras-tu aux règles du clan ?</p>
                  <div className="radio-group">
                    <label><input type="radio" name="q2" value="oui" required /> Oui</label>
                    <label><input type="radio" name="q2" value="non" /> Non</label>
                  </div>
                </div>

                <div className="question-block highlight-q">
                  <p>3. Es-tu actif pour les événements du clan ? (OBLIGATOIRE)</p>
                  <div className="radio-group">
                    <label><input type="radio" name="q3" value="oui" required /> Oui</label>
                    <label><input type="radio" name="q3" value="non" /> Non</label>
                  </div>
                </div>

                <div className="question-block">
                  <p>4. Acceptes-tu les règles du clan Shadow Sovereign ?</p>
                  <div className="radio-group">
                    <label><input type="radio" name="q4" value="oui" required /> Oui</label>
                    <label><input type="radio" name="q4" value="non" /> Non</label>
                  </div>
                </div>

                <div className="question-block">
                  <p>5. Es-tu prêt à représenter le clan avec honneur ?</p>
                  <div className="radio-group">
                    <label><input type="radio" name="q5" value="oui" required /> Oui</label>
                    <label><input type="radio" name="q5" value="non" /> Non</label>
                  </div>
                </div>

                {errors.length > 0 && (
                  <div className="error-msg" role="alert">
                    <i className="fas fa-exclamation-triangle"></i>
                    <div>{errors.join(' | ')}</div>
                  </div>
                )}

                <button type="submit" className="btn primary w-100">Soumettre ma candidature</button>
              </form>
            </div>
          </div>
        </section>

        {/* --- Règlement --- */}
        <section id="rules-page" className={`page ${currentPage === 'rules-page' ? 'active' : ''}`} style={{ display: currentPage === 'rules-page' ? 'block' : 'none' }}>
          <div className="container">
            <h2 className="section-title">📢 RÈGLES DU CLAN 2S •</h2>
            <div className="rules-container slide-in-bottom">
              <ol className="rules-list">
                <li><strong>Pseudo obligatoire :</strong> Tous les membres doivent afficher le symbole <strong>2S •</strong> dans leur pseudo.</li>
                <li><strong>Présence active :</strong> Chaque membre doit être actif au minimum 3 fois par semaine.</li>
                <li><strong>Entraînements :</strong> Participation obligatoire. Toute absence non justifiée sera signalée.</li>
                <li><strong>Classement :</strong> Les joueurs inactifs seront retirés pour laisser la place aux motivés.</li>
                <li><strong>Guerre de clan :</strong> Obligatoire pour tous afin d'atteindre la 1ère place.</li>
                <li><strong>Spécialisation :</strong> Présence requise lors des entraînements de votre mode (BR ou MJ).</li>
                <li><strong>Absences :</strong> En cas d'empêchement, <strong>prévenir un administrateur en inbox</strong> au moins 3h avant.</li>
                <li><strong>Confidentialité :</strong> Ce qui se passe à Shipment reste à Shipment (pas de screenshots 1vs1 sans accord).</li>
              </ol>
              <div className="rules-footer">
                <p><em>Note : De nouvelles règles peuvent être ajoutées ou retirées par le staff.</em></p>
                <p><strong>2S • Family — On avance ensemble.</strong></p>
                <button className="btn primary mt-3" onClick={acceptRules}>J'ai lu et j'accepte le règlement</button>
              </div>
            </div>
          </div>
        </section>

        {/* --- Succès --- */}
        <section id="success" className={`page ${currentPage === 'success' ? 'active' : ''}`} style={{ display: currentPage === 'success' ? 'block' : 'none' }}>
          <div className="container">
            <h2 className="section-title">✅ Candidature soumise</h2>
            <div className="success-content">
              <p>Merci pour ta candidature ! Elle a été reçue et sera examinée dans les plus brefs délais.</p>
              <p>Rejoins maintenant le groupe WhatsApp du clan pour rester informé :</p>
              <a
                href="https://chat.whatsapp.com/JDOeeA4Hxhw8Xj2HBjtuhA?mode=gi_t"
                target="_blank"
                rel="noopener noreferrer"
                className="btn primary whatsapp-btn mt-3"
              >
                <i className="fab fa-whatsapp"></i>&nbsp; Appuyez ici pour continuer
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-content">
          <h3>Shadow Sovereign Clan</h3>
          <p>Call of Duty Mobile</p>
          <div className="socials">
            <a href="https://wa.me/NUMERO" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><i className="fab fa-whatsapp"></i></a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Discord"><i className="fab fa-discord"></i></a>
          </div>
          <p className="copyright">© 2026 Shadow Sovereign Clan. Tous droits réservés.</p>
        </div>
      </footer>
    </>
  );
}
