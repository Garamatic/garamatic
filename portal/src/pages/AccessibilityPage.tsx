import { Eye, Globe } from '@phosphor-icons/react'
import { MUNICIPALITY } from '../config/municipality'

export function AccessibilityPage() {
  return (
    <div className="container-page py-8 md:py-12">
      <div className="mb-8 pb-4 border-b border-border">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2 font-heading uppercase tracking-wider">
          Déclaration d'Accessibilité
        </h1>
        <p className="text-text-secondary italic">
          Conformité WCAG 2.1 — niveau AA
        </p>
      </div>

      <div className="space-y-8 max-w-3xl">
        <section>
          <h2 className="section-title"><Eye size={20} /> Engagement</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            {MUNICIPALITY.article} {MUNICIPALITY.name} s'engage à rendre ses services numériques accessibles
            conformément à la loi du 19 juillet 2018 relative à l'accessibilité des sites web et des applications mobiles
            des organismes du secteur public.
          </p>
        </section>

        <section>
          <h2 className="section-title">État de conformité</h2>
          <div className="bg-success-bg border border-success rounded-md p-5">
            <p className="text-sm text-success font-medium">
              Ce site est partiellement conforme au niveau AA des WCAG 2.1.
            </p>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed mt-3">
            Le Guichet Citoyen a été conçu pour être accessible aux personnes en situation de handicap,
            notamment aux personnes utilisant des lecteurs d'écran, des claviers uniquement ou des outils de zoom.
          </p>
        </section>

        <section>
          <h2 className="section-title">Mesures d'accessibilité</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            Les mesures suivantes ont été mises en œuvre :
          </p>
          <ul className="list-disc list-inside text-sm text-text-secondary space-y-1">
            <li>Navigation au clavier possible sur toutes les pages</li>
            <li>Contraste des couleurs conforme au niveau AA</li>
            <li>Textes alternatifs pour les images informatives</li>
            <li>Structure sémantique HTML (titres, listes, landmarks)</li>
            <li>Respect des préférences de réduction de mouvement</li>
            <li>Formulaires avec étiquettes associées et messages d'erreur</li>
            <li>Focus visible sur tous les éléments interactifs</li>
          </ul>
        </section>

        <section>
          <h2 className="section-title">Contenu non accessible</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Certains contenus tiers ou documents PDF téléchargés peuvent ne pas être entièrement accessibles.
            Nous travaillons à leur mise en conformité progressive.
            Si vous rencontrez une difficulté, contactez-nous (voir ci-dessous).
          </p>
        </section>

        <section>
          <h2 className="section-title">Signalement d'un problème</h2>
          <div className="bg-surface border border-border rounded-md p-5 space-y-2 text-sm text-text-secondary">
            <p className="text-text-primary font-medium">Contactez le service informatique :</p>
            <p>Tél. : {MUNICIPALITY.phone}</p>
            <p>Email : {MUNICIPALITY.email}</p>
            <p>
              Adresse : {MUNICIPALITY.address.street}, {MUNICIPALITY.address.postcode} {MUNICIPALITY.address.locality}
            </p>
          </div>
        </section>

        <section>
          <h2 className="section-title"><Globe size={20} /> Procédure de recours</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Si vous constatez un défaut d'accessibilité qui vous empêche d'accéder à un contenu ou à un service,
            vous pouvez envoyer un signalement à l'adresse ci-dessus.
            En l'absence de réponse satisfaisante dans un délai de 30 jours, vous pouvez introduire une réclamation auprès du
            <a href="https://www.belgique.be/fr/justice/ombudsman_federal" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"> Médiateur fédéral</a>.
          </p>
        </section>

        <p className="text-xs text-text-muted pt-4 border-t border-border">
          Dernière mise à jour : 1 juin 2025
        </p>
      </div>
    </div>
  )
}
