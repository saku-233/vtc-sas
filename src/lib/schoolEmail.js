// 学校邮箱白名单：只有以下两个邮箱可以登录/注册。
const SCHOOL_EMAILS = ["123@stu.vtc.edu.hk", "123@vtc.edu.hk"];

export function isSchoolEmail(email) {
  if (!email) return false;
  return SCHOOL_EMAILS.includes(email.trim().toLowerCase());
}

// 白名单账号的固定密码，用户无需自行输入。
export const FIXED_PASSWORD = "VtcSas@2026";

export function schoolEmailHint() {
  return "仅允许 123@stu.vtc.edu.hk 或 123@vtc.edu.hk 登录。";
}