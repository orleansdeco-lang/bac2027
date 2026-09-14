import { createClient } from "@supabase/supabase-js";

const url = "https://erbvmpnxufgeinqnshzu.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYnZtcG54dWZnZWlucW5zaHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMjkzMzEsImV4cCI6MjEwNDcwNTMzMX0.STGUNuth4J2-TXqvH_BNwRJEsxH5RjSmhjUPttLN998";
const client = createClient(url, key);

async function main() {
  console.log("=== CHECKING SUPABASE TABLES ===");
  try {
    const { data: profiles, error: pErr } = await client.from("student_profiles").select("*");
    console.log("student_profiles count:", profiles?.length, "error:", pErr?.message);
    if (profiles) {
      console.log("Profiles list:", profiles.map(p => ({ id: p.id, name: `${p.first_name} ${p.last_name}`, email: p.email || p.raw_draft?.student_email, phone: p.student_phone, status: p.access_status })));
    }

    const { data: orders, error: oErr } = await client.from("payment_orders").select("*");
    console.log("payment_orders count:", orders?.length, "error:", oErr?.message);
    if (orders) {
      console.log("Orders list:", orders.map(o => ({ id: o.id, user_id: o.user_id, plan: o.plan, status: o.status, amount: o.amount, receipt: o.receipt_path })));
    }

    const { data: roles, error: rErr } = await client.from("user_roles").select("*");
    console.log("user_roles count:", roles?.length, "error:", rErr?.message);
    if (roles) {
      console.log("Roles list:", roles);
    }
  } catch (e) {
    console.error("Exception:", e);
  }
}

main();
