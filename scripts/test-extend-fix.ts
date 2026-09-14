import { extendStudentSubscription } from "../src/lib/operations/subscriptions";
import { OWNER_UUID, OWNER_EMAIL } from "../src/lib/operations/auth";

async function run() {
  console.log("Testing extendStudentSubscription with Owner UUID:", OWNER_UUID);
  const res1 = await extendStudentSubscription(OWNER_UUID, OWNER_UUID, {
    type: "custom",
    days: 365,
    plan: "season",
    reason: "Test yearly activation",
  });
  console.log("Res1 (Owner UUID):", res1);

  console.log("Testing extendStudentSubscription with Owner Email:", OWNER_EMAIL);
  const res2 = await extendStudentSubscription(OWNER_UUID, OWNER_EMAIL, {
    type: "1_month",
    days: 30,
    plan: "monthly",
    reason: "Test monthly activation",
  });
  console.log("Res2 (Owner Email):", res2);

  console.log("Testing extendStudentSubscription with new student UUID:");
  const testStudentId = "c8b6b0c2-9e32-4d6c-a81d-66e5fbb49411";
  const res3 = await extendStudentSubscription(OWNER_UUID, testStudentId, {
    type: "1_month",
    days: 30,
    plan: "monthly",
    reason: "Test new student activation",
  });
  console.log("Res3 (New Student):", res3);

  if (!res1.success || !res2.success || !res3.success) {
    console.error("FAIL: One or more activations failed");
    process.exit(1);
  }
  console.log("ALL TESTS PASSED!");
}

run().catch((err) => {
  console.error("Crash:", err);
  process.exit(1);
});
