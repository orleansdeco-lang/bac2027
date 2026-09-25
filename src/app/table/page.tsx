import { redirect } from "next/navigation";

export default function TableRedirectPage() {
  redirect("/diwan?tab=majlis");
}
