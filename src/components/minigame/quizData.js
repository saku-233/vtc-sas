export const QUIZ_QUESTIONS = [
  {
    subject: "IT114115 · 编程基础",
    question: "下列哪个是合法的整数字面量？",
    options: ["3.14a", "08", "0x1F", "1_000."],
    answer: 2,
  },
  {
    subject: "IT114115 · 数据类型",
    question: "用于存放真假值的数据类型是？",
    options: ["int", "boolean", "char", "double"],
    answer: 1,
  },
  {
    subject: "IT114115 · 数制转换",
    question: "二进制 1011 等于十进制？",
    options: ["9", "11", "13", "15"],
    answer: 1,
  },
  {
    subject: "IT114115 · 数制转换",
    question: "十六进制 1F 等于十进制？",
    options: ["15", "31", "33", "63"],
    answer: 1,
  },
  {
    subject: "IT114115 · 布尔逻辑",
    question: "NOT (TRUE AND FALSE) 的结果是？",
    options: ["TRUE", "FALSE", "不确定", "语法错误"],
    answer: 0,
  },
  {
    subject: "IT114115 · 控制流程",
    question: "for 循环通常用于什么场景？",
    options: ["只执行一次", "已知次数的重复", "无限循环", "条件分支"],
    answer: 1,
  },
  {
    subject: "IT114115 · 控制流程",
    question: "if 语句的判断结果必须是？",
    options: ["整数", "字符串", "布尔值", "数组"],
    answer: 2,
  },
  {
    subject: "IT114115 · 函数",
    question: "函数的「参数」是指？",
    options: ["函数返回值", "调用时传入的数据", "函数名称", "循环次数"],
    answer: 1,
  },
  {
    subject: "IT114115 · 数组",
    question: "数组下标通常从哪个数开始？",
    options: ["1", "0", "-1", "随机"],
    answer: 1,
  },
  {
    subject: "IT114115 · 算法",
    question: "流程图中菱形符号表示？",
    options: ["开始/结束", "处理步骤", "判断", "输入/输出"],
    answer: 2,
  },
];

export const QUESTION_TIME = 15;
export const MAX_HP = 3;

export function scoreToRank(score) {
  const max = QUIZ_QUESTIONS.length * (100 + QUESTION_TIME * 10) * 5;
  const ratio = score / max;
  if (ratio >= 0.8) return { rank: "S", label: "LEGENDARY ACE" };
  if (ratio >= 0.6) return { rank: "A", label: "ACE PILOT" };
  if (ratio >= 0.4) return { rank: "B", label: "VETERAN" };
  if (ratio >= 0.2) return { rank: "C", label: "ROOKIE" };
  return { rank: "D", label: "CADET" };
}