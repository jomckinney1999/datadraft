import { redirect } from "next/navigation";

/** Playbook styles were removed — keep the URL from going 404. */
export default function PlaybookRedirect() {
  redirect("/learn");
}
