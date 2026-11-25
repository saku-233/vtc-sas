// 学校邮箱白名单：只有这些域名的邮箱可以登录/注册。
// 选中答案后会按需调整（仅学生 / 学生+教师 / 全部 VTC 域名）。
const SCHOOL_DOMAINS = ["stu.vtc.edu.hk", "vtc.edu.hk"];

export function isSchoolEmail(email) {
  if (!email) return false;
  const at = email.lastIndexOf("@");
  if (at < 0) return false;
  const domain = email.slice(at + 1).toLowerCase().trim();
  return SCHOOL_DOMAINS.includes(domain);
}

export function schoolEmailHint() {
  return "请使用 VTC 学校邮箱（@stu.vtc.edu.hk 或 @vtc.edu.hk）登录。";
}