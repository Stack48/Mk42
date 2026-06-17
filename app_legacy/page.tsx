// PAGE RACINE "/" — redirige vers /commissions
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/commissions");
}
