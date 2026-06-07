import { FileText } from '@phosphor-icons/react'
import { MUNICIPALITY } from '../config/municipality'

export function TermsPage() {
  return (
    <div className="container-page py-8 md:py-12">
      <div className="mb-8 pb-4 border-b border-border">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2 font-heading uppercase tracking-wider">
          Conditions d'Utilisation
        </h1>
        <p className="text-text-secondary italic">
          Règles d'accès et d'utilisation du Guichet Citoyen
        </p>
      </div>

      <div className="space-y-8 max-w-3xl">
        <section>
          <h2 className="section-title"><FileText size={20} /> Objet du service</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Le Guichet Citoyen est un service en ligne mis à disposition par {MUNICIPALITY.article} {MUNICIPALITY.name}
            permettant aux citoyens de formuler des demandes, de signaler des problèmes et de suivre l'avancement de leurs dossiers.
          </p>
        </section>

        <section>
          <h2 className="section-title">Accès au service</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            L'accès au service est ouvert à tous les citoyens de la commune et, dans certaines limites, aux personnes extérieures.
            Pour consulter l'historique des demandes, l'utilisateur doit s'identifier au moyen de son adresse email.
            L'identification via eID ou itsme sera progressivement déployée.
          </p>
        </section>

        <section>
          <h2 className="section-title">Engagements de l'utilisateur</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            En utilisant le Guichet Citoyen, vous vous engagez à :
          </p>
          <ul className="list-disc list-inside text-sm text-text-secondary space-y-1">
            <li>Fournir des informations exactes, complètes et à jour</li>
            <li>Ne pas usurper l'identité d'un tiers</li>
            <li>Ne pas utiliser le service à des fins illégales ou malveillantes</li>
            <li>Ne pas déposer des demandes abusives ou répétitives</li>
            <li>Respecter la vie privée et les droits des tiers</li>
          </ul>
        </section>

        <section>
          <h2 className="section-title">Disponibilité du service</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            {MUNICIPALITY.article} {MUNICIPALITY.name} s'efforce de maintenir le service accessible en permanence.
            Toutefois, des interruptions peuvent survenir pour des raisons de maintenance, de mise à jour ou de force majeure.
            En cas d'indisponibilité, les citoyens sont invités à contacter directement le guichet communal.
          </p>
        </section>

        <section>
          <h2 className="section-title">Traitement des demandes</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            Le délai de traitement varie selon la nature de la demande :
          </p>
          <ul className="list-disc list-inside text-sm text-text-secondary space-y-1">
            <li>Nuisance : 2 jours ouvrables</li>
            <li>Voirie : 5 jours ouvrables</li>
            <li>Propreté : 10 jours ouvrables</li>
            <li>Environnement : 10 jours ouvrables</li>
            <li>Permis d'urbanisme : 30 jours ouvrables (délai légal)</li>
            <li>Demande générale : 10 jours ouvrables</li>
          </ul>
          <p className="text-sm text-text-secondary mt-3">
            Ces délais sont indicatifs et peuvent être prolongés en cas de complexité ou de nécessité d'informations complémentaires.
          </p>
        </section>

        <section>
          <h2 className="section-title">Responsabilité</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            {MUNICIPALITY.article} {MUNICIPALITY.name} ne peut être tenue responsable des dommages résultant d'une indisponibilité
            du service, d'une erreur de saisie de la part de l'utilisateur ou d'une interruption des communications électroniques.
            Les demandes déposées via le Guichet Citoyen n'engagent pas de responsabilité supplémentaire à celle prévue par la loi.
          </p>
        </section>

        <section>
          <h2 className="section-title">Propriété intellectuelle</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            L'ensemble du contenu du site (textes, images, logos, code) est la propriété de {MUNICIPALITY.article} {MUNICIPALITY.name}
            ou de ses partenaires. Toute reproduction, distribution ou utilisation sans autorisation écrite est interdite.
          </p>
        </section>

        <section>
          <h2 className="section-title">Modifications</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Les présentes conditions d'utilisation peuvent être modifiées à tout moment.
            Les utilisateurs sont invités à les consulter régulièrement.
            En cas de modification substantielle, une notification sera affichée sur le site.
          </p>
        </section>

        <p className="text-xs text-text-muted pt-4 border-t border-border">
          Dernière mise à jour : 1 juin 2025
        </p>
      </div>
    </div>
  )
}
