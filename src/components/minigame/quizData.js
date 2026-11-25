export const QUIZ_QUESTIONS = [
  {
    subject: "ITP4901 · JavaScript",
    question: "在 JavaScript 中，typeof null 的结果是？",
    options: ["null", "undefined", "object", "string"],
    answer: 2,
  },
  {
    subject: "ITP4905 · 数据库",
    question: "SQL 中用于筛选行的关键字是？",
    options: ["FILTER", "WHERE", "GROUP BY", "ORDER BY"],
    answer: 1,
  },
  {
    subject: "ITP4912 · 网络",
    question: "子网掩码 /24 对应的十进制是？",
    options: ["255.255.255.0", "255.255.0.0", "255.0.0.0", "255.255.255.255"],
    answer: 0,
  },
  {
    subject: "LANG1003 · 学术英语",
    question: "单词 hypothesis 的含义是？",
    options: ["结论", "假设", "方法论", "摘要"],
    answer: 1,
  },
  {
    subject: "ITP4905 · 数据库",
    question: "主键（Primary Key）的作用是？",
    options: ["加速排序", "唯一标识每行", "链接外键", "加密数据"],
    answer: 1,
  },
  {
    subject: "ITP4901 · JavaScript",
    question: "下列哪个会返回 true？",
    options: ["[] == false", "NaN === NaN", "null === undefined", "0 === ''"],
    answer: 0,
  },
  {
    subject: "ITP4912 · 网络",
    question: "192.168.1.1 属于哪类地址？",
    options: ["公网地址", "私有地址", "回环地址", "广播地址"],
    answer: 1,
  },
  {
    subject: "ITP4905 · 数据库",
    question: "JOIN 关键字的作用是？",
    options: ["删除数据", "合并多表数据", "创建索引", "提交事务"],
    answer: 1,
  },
  {
    subject: "ITP4901 · JavaScript",
    question: "关于 const，下列说法正确的是？",
    options: ["可重新赋值", "不可重新赋值", "不存在变量提升", "仅作用于函数"],
    answer: 1,
  },
  {
    subject: "LANG1003 · 学术写作",
    question: "methodology 在论文中指？",
    options: ["研究背景", "研究方法", "研究结果", "参考文献"],
    answer: 1,
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