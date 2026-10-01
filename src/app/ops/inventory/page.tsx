import { redirect } from "next/navigation";

export default function InventoryPage() {
  // Physical kit inventory has been eliminated: platform offers strictly digital subscriptions (Annual & Monthly)
  // with delivery acting solely as a COD payment method.
  redirect("/ops/orders");
}
