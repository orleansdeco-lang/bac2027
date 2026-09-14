import { createClient } from "@supabase/supabase-js";

const url = "https://erbvmpnxufgeinqnshzu.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYnZtcG54dWZnZWlucW5zaHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMjkzMzEsImV4cCI6MjEwNDcwNTMzMX0.STGUNuth4J2-TXqvH_BNwRJEsxH5RjSmhjUPttLN998";

const client = createClient(url, key);

async function main() {
  const { data: plans, error: pErr } = await client.from("subscription_plans").select("*");
  console.log("Subscription plans:", { plans, error: pErr });
}

main().catch(console.error);
