import { OperationsCockpitDashboard } from "@/components/ops/OperationsCockpitDashboard";

export const metadata = {
  title: "لوحة المؤشرات المركزية | SHATER Operations Cockpit",
  description: "المراقبة اللحظية للعمليات ومؤشرات التحويل والتدفق المالي الحقيقي لمنصة شاطر بكالوريا",
};

export default function OpsOverviewPage() {
  return <OperationsCockpitDashboard />;
}
