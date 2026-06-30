import { CheckCircle, Clock, XCircle } from "lucide-react";

type StatutKyc = "EN_ATTENTE" | "VALIDE" | "REFUSE";

export default function KycBadge({ statut }: { statut: StatutKyc }) {
  if (statut === "VALIDE") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
        <CheckCircle className="w-3 h-3" /> Vérifié
      </span>
    );
  }
  if (statut === "EN_ATTENTE") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
        <Clock className="w-3 h-3" /> En attente
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
      <XCircle className="w-3 h-3" /> Refusé
    </span>
  );
}
