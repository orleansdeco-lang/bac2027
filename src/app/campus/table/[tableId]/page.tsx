import { redirect } from "next/navigation";

interface SingleTablePageProps {
  params: { tableId: string };
}

export default function SingleTablePage({ params }: SingleTablePageProps) {
  const tableId = params?.tableId;
  if (tableId) {
    redirect(`/diwan?tab=majlis&roomId=${encodeURIComponent(tableId)}`);
  }
  redirect("/diwan?tab=majlis");
}
