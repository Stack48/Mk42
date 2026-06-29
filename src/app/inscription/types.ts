export type ProfilId = 'particulier' | 'professionnel' | 'entreprise'

export type Step2Data = {
  nom: string
  prenom: string
  email: string
  telephone: string
  fonction: string
  motDePasse: string
  confirmation: string
}

export type Step3Data = {
  siret: string
  raisonSociale: string
  adresseSiege: string
  codeApe: string
  representantLegal: string
  telephone: string
  tvaIntra: string
}

export type Step4Data = {
  titulaire: string
  iban: string
  ibanConfirm: string
  bic: string
  ribFile: File | null
}

export type Step5Data = {
  docType: string
  docNum: string
  kbisFile: File | null
  idFile: File | null
}

export type WizardFormData = {
  profil: ProfilId | null
  step2: Partial<Step2Data>
  step3: Partial<Step3Data>
  step4: Partial<Step4Data>
  step5: Partial<Step5Data>
}

export const EMPTY_WIZARD_DATA: WizardFormData = {
  profil: null,
  step2:  {},
  step3:  {},
  step4:  { ribFile: null },
  step5:  { docType: "Carte d'identité", kbisFile: null, idFile: null },
}
