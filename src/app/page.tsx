import { redirect } from "next/navigation";

/* The site lives at /sivaguru-ravi (author decision — name in the URL).
 * Dev/Node serves a real 307 here; the static export emits a meta-refresh
 * stub, and nginx issues the authoritative 301 (deploy/default.conf). */
export default function Root() {
  redirect("/sivaguru-ravi");
}
