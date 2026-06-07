import { ShieldCheck } from '@phosphor-icons/react'
import { MUNICIPALITY } from '../config/municipality'

export function PrivacyPage() {
  return (
    <div className="container-page py-8 md:py-12">
      <div className="mb-8 pb-4 border-b border-border">
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2 font-heading uppercase tracking-wider">
          Politique de Confidentialité
        </h1>
        <p className="text-text-secondary italic">
          Traitement des données à caractère personnel — RGPD
        </p>
      </div>

      <div className="space-y-8 max-w-3xl">
        <section>
          <h2 className="section-title"><ShieldCheck size={20} /> Responsable du traitement</h2>
          <div className="bg-surface border border-border rounded-md p-5 space-y-2 text-sm text-text-secondary">
            <p><strong className="text-text-primary">{MUNICIPALITY.article} {MUNICIPALITY.name}</strong></p>
            <p>{MUNICIPALITY.address.street}</p>
            <p>{MUNICIPALITY.address.postcode} {MUNICIPALITY.address.locality}</p>
            <p>Tél. : {MUNICIPALITY.phone}</p>
            <p>Email : {MUNICIPALITY.email}</p>
            <p>N° d'entreprise : {MUNICIPALITY.enterpriseNumber}</p>
            <p>RPM : {MUNICIPALITY.rpm}</p>
          </div>
        </section>

        <section>
          <h2 className="section-title">Données collectées</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            Dans le cadre de l'utilisation du Guichet Citoyen, nous collectons les données suivantes :
          </p>
          <ul className="list-disc list-inside text-sm text-text-secondary space-y-1">
            <li>Nom et prénom du citoyen</li>
            <li>Adresse email</li>
            <li>Numéro de téléphone (facultatif)</li>
            <li>Description de la demande</li>
            <li>Pièces jointes (facultatif)</li>
            <li>Adresse de la localisation concernée</li>
          </ul>
        </section>

        <section>
          <h2 className="section-title">Finalité du traitement</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Les données sont traitées dans le but de permettre le suivi des demandes municipales,
            de garantir un service public efficace et d'assurer la traçabilité des interventions.
          </p>
        </section>

        <section>
          <h2 className="section-title">Délégué à la Protection des Données</h2>
          <div className="bg-surface border border-border rounded-md p-5 space-y-2 text-sm text-text-secondary">
            <p><strong className="text-text-primary">{MUNICIPALITY.dpo.name}</strong></p>
            <p>Tél. : {MUNICIPALITY.dpo.phone}</p>
            <p>Email : {MUNICIPALITY.dpo.email}</p>
          </div>
        </section>

        <section>
          <h2 className="section-title">Durée de conservation</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Les données sont conservées pendant <strong className="text-text-primary">3 ans</strong> à compter de la clôture du dossier,
            conformément aux obligations légales applicables aux archives communales.
          </p>
        </section>

        <section>
          <h2 className="section-title">Vos droits</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
          </p>
          <ul className="list-disc list-inside text-sm text-text-secondary space-y-1">
            <li>Droit d'accès à vos données</li>
            <li>Droit de rectification</li>
            <li>Droit à l'effacement (« droit à l'oubli »)</li>
            <li>Droit de limitation du traitement</li>
            <li>Droit d'opposition</li>
            <li>Droit à la portabilité des données</li>
          </ul>
          <p className="text-sm text-text-secondary mt-3">
            Pour exercer ces droits, contactez le Délégué à la Protection des Données à l'adresse ci-dessus.
          </p>
        </section>

        <section>
          <h2 className="section-title">Cookies</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Le Guichet Citoyen utilise uniquement des cookies techniques nécessaires au fonctionnement
            du site (gestion de la session, préférences de langue). Aucun cookie de traçage ou de publicité n'est utilisé.
          </p>
        </section>

        <p className="text-xs text-text-muted pt-4 border-t border-border">
          Dernière mise à jour : 1 juin 2025
        </p>
      </div>
    </div>
  )
}
