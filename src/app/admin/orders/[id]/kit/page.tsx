import React from "react";
import { notFound } from "next/navigation";
import { getAdminOrders } from "@/lib/admin/orders";
import { buildPhysicalKitDocumentData } from "@/lib/kit/generator";
import { PhysicalKitDocument } from "@/components/kit/PhysicalKitDocument";
import { PrintKitClientToolbar } from "./PrintKitClientToolbar";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderKitPrintPage({ params }: PageProps) {
  const { id } = await params;
  if (!id) notFound();

  // Load order data
  let orderRecord = null;
  try {
    const { orders } = await getAdminOrders();
    orderRecord = orders.find((o) => o.id === id || o.order_number === id);
  } catch (err) {
    console.error("[KitPrintPage] Error loading order:", err);
  }

  if (!orderRecord) {
    notFound();
  }

  // Generate kit document data with QR codes
  const kitData = await buildPhysicalKitDocumentData(orderRecord);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-6 px-2 sm:px-6">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .a4-print-wrapper {
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Client Toolbar for Print & Download PDF (hidden on print) */}
      <div className="max-w-[210mm] mx-auto mb-6 no-print">
        <PrintKitClientToolbar orderNumber={orderRecord.order_number} />
      </div>

      {/* Main A4 Document */}
      <div className="a4-print-wrapper max-w-[210mm] mx-auto shadow-2xl rounded-2xl overflow-hidden bg-white">
        <PhysicalKitDocument data={kitData} />
      </div>
    </div>
  );
}
