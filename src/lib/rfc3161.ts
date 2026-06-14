import { createHash, randomBytes } from "crypto";

export type LogData = {
  id: string;
  trackingLinkId: string;
  ipHash: string;
  userAgent: string;
  createdAt: Date;
};

export type CertifyResult = {
  dataHash: string;   // SHA-256 des données du log
  token: string;      // Token d'horodatage retourné par la TSA
  certifiedAt: Date;
};

/**
 * Hash les données du log en SHA-256.
 * C'est ce hash (et non les données brutes) qui est envoyé à la TSA —
 * la TSA ne voit jamais le contenu, seulement son empreinte.
 */
function hashLogData(logData: LogData): string {
  const payload = JSON.stringify({
    id: logData.id,
    trackingLinkId: logData.trackingLinkId,
    ipHash: logData.ipHash,
    userAgent: logData.userAgent,
    createdAt: logData.createdAt.toISOString(),
  });
  return createHash("sha256").update(payload).digest("hex");
}

/**
 * Certifie un TrackingLog via RFC 3161 (Time Stamp Protocol).
 *
 * EN PRODUCTION — intégration FreeTSA (https://freetsa.org) :
 *
 *   1. Construire la requête TSA (TimeStampReq) en ASN.1/DER :
 *        - utiliser la lib `node-forge` ou `pkijs` pour encoder le MessageImprint
 *        - MessageImprint = { hashAlgorithm: SHA-256, hashedMessage: Buffer(dataHash) }
 *        - nonce aléatoire pour éviter les replays
 *        - certReq: true pour recevoir le certificat de la TSA dans la réponse
 *
 *   2. Envoyer via HTTP POST :
 *        const res = await fetch("https://freetsa.org/tsr", {
 *          method: "POST",
 *          headers: { "Content-Type": "application/timestamp-query" },
 *          body: tsqDerBuffer,
 *        });
 *        const tsrBuffer = await res.arrayBuffer();
 *
 *   3. Vérifier et extraire le token :
 *        - décoder la TimeStampResp (status + timeStampToken)
 *        - vérifier status.status === 0 (granted)
 *        - stocker le token DER encodé en base64 dans TrackingLog.rfc3161Hash
 *
 *   4. Persister :
 *        await prisma.trackingLog.update({
 *          where: { id: logData.id },
 *          data: { rfc3161Hash: tokenBase64 },
 *        });
 *
 * Le token stocké permet de prouver à n'importe quel moment, de manière
 * vérifiable et opposable, qu'un hash précis existait à un instant précis.
 */
export async function certifyLog(logData: LogData): Promise<CertifyResult> {
  const dataHash = hashLogData(logData);

  // --- SIMULATION (à remplacer par l'appel réseau FreeTSA en production) ---
  // On simule un token TSA : en réalité ce serait un blob DER signé par la TSA,
  // encodé en base64. Ici on retourne un faux nonce pour permettre le
  // développement offline.
  const fakeToken = `SIMULATED_TSA_TOKEN:sha256=${dataHash}:nonce=${randomBytes(8).toString("hex")}`;
  // --- FIN SIMULATION ---

  return {
    dataHash,
    token: fakeToken,
    certifiedAt: new Date(),
  };
}
