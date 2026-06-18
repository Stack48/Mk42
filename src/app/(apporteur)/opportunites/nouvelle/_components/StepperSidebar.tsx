import styles from './css/StepperSidebar.module.css'

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 7l3 3 6-6" />
    </svg>
  )
}

const STEPS = [
  { num: 1, label: 'Vos informations',          hint: '(pré-rempli)' },
  { num: 2, label: 'Informations du client',     hint: null },
  { num: 3, label: 'Détails du chantier',        hint: null },
  { num: 4, label: "Soumettre l'opportunité",    hint: null },
]

interface Props {
  currentStep: number
}

export default function StepperSidebar({ currentStep }: Props) {
  return (
    <aside className={styles.sidebar} aria-label="Progression du formulaire">
      <p className={styles.title}>Étapes de l'inscription</p>
      <ol className={styles.list}>
        {STEPS.map(step => {
          const status =
            step.num < currentStep ? 'done' :
            step.num === currentStep ? 'active' : 'inactive'

          return (
            <li
              key={step.num}
              className={`${styles.item} ${styles[status]}`}
              aria-current={status === 'active' ? 'step' : undefined}
            >
              <div className={styles.badge} aria-hidden="true">
                {status === 'done' ? <CheckIcon /> : step.num}
              </div>
              <div className={styles.content}>
                <span className={styles.name}>
                  {step.label}
                  {status === 'done' && step.hint && (
                    <span className="text-[#64748B] font-normal ml-1">
                      {step.hint}
                    </span>
                  )}
                </span>
                {status === 'done' && (
                  <span className={`${styles.sub} ${styles.validated}`}>Validé</span>
                )}
                {status === 'active' && (
                  <span className={`${styles.sub} ${styles.inProgress}`}>En cours</span>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </aside>
  )
}
