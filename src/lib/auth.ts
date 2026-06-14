// Stub auth — replace with Clerk's auth() once configured
export async function getCurrentEntrepriseId(): Promise<string> {
  const stub = process.env.STUB_ENTREPRISE_ID;
  if (!stub) throw new Error("STUB_ENTREPRISE_ID not set");
  return stub;
}
