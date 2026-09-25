import { redirect } from "next/navigation";

export default function YptPageRedirect() {
  redirect("/diwan?tab=majlis");
}
