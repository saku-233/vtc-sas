// School email allowlist: only the following addresses may sign in / register.
const SCHOOL_EMAILS = ["123@stu.vtc.edu.hk", "123@vtc.edu.hk"];

export function isSchoolEmail(email) {
  if (!email) return false;
  return SCHOOL_EMAILS.includes(email.trim().toLowerCase());
}

// Fixed password for allowlisted accounts; users do not enter it themselves.
export const FIXED_PASSWORD = "Vtc123456";

export function schoolEmailHint() {
  return "Only 123@stu.vtc.edu.hk or 123@vtc.edu.hk may sign in.";
}