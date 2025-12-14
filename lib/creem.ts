export function getCreemTestMode() {
  const v = process.env.CREEM_TEST_MODE;
  if (typeof v === "string") {
    if (v.toLowerCase() === "true") return true;
    if (v.toLowerCase() === "false") return false;
  }
  return process.env.NODE_ENV !== "production";
}

