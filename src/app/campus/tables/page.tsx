import { redirect } from "next/navigation";

export default function CampusTablesRedirectPage() {
  redirect("/diwan?tab=majlis");
}
