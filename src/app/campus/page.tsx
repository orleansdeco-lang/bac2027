import { redirect } from "next/navigation";

export default function CampusRedirectPage() {
  redirect("/diwan?tab=experiences");
}
