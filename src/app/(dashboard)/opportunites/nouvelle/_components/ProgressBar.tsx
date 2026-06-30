import styles from './css/ProgressBar.module.css'

interface Props {
  step: number
  totalSteps: number
}

export default function ProgressBar({ step, totalSteps }: Props) {
  const pct = Math.round((step / totalSteps) * 100)
  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-valuenow={step}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Étape ${step} sur ${totalSteps}`}
    >
      <div className={styles.fill} style={{ width: `${pct}%` }} />
    </div>
  )
}
