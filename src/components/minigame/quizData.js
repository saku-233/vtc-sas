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
  {
    subject: "IT114115 · 云端运算",
    question: "云计算的核心特征是？",
    options: ["只能在本地运行", "按需自助、弹性扩展", "必须购买硬件", "单机离线使用"],
    answer: 1,
  },
  {
    subject: "IT114115 · 云端运算",
    question: "IaaS 提供的是？",
    options: ["完整应用", "虚拟计算基础设施", "开发平台", "数据库即服务"],
    answer: 1,
  },
  {
    subject: "IT114115 · 云端运算",
    question: "PaaS 主要面向哪类用户？",
    options: ["终端用户", "开发者", "硬件管理员", "财务人员"],
    answer: 1,
  },
  {
    subject: "IT114115 · 云端运算",
    question: "SaaS 的典型例子是？",
    options: ["虚拟机", "网盘", "在线办公文档", "负载均衡器"],
    answer: 2,
  },
  {
    subject: "IT114115 · 云端运算",
    question: "公有云的主要特点是？",
    options: ["仅供企业内部使用", "由第三方运营、多租户共享", "部署在本地机房", "不联网"],
    answer: 1,
  },
  {
    subject: "IT114115 · 云端运算",
    question: "虚拟化技术的主要作用是？",
    options: ["加密数据", "在一台物理机上运行多个虚拟环境", "加快网络速度", "压缩文件"],
    answer: 1,
  },
  {
    subject: "IT114115 · 云端运算",
    question: "云服务的「弹性」指？",
    options: ["界面可换肤", "资源随需求动态增减", "价格固定不变", "只能用一年"],
    answer: 1,
  },
  {
    subject: "IT114115 · 云端运算",
    question: "下列哪项属于 IaaS 服务？",
    options: ["Azure 虚拟机", "Gmail", "Google Docs", "Microsoft 365"],
    answer: 0,
  },
  {
    subject: "IT114115 · 云端运算",
    question: "混合云是指？",
    options: ["只有公有云", "公有云与私有云结合", "多台手机", "离线电脑"],
    answer: 1,
  },
  {
    subject: "IT114115 · 云端运算",
    question: "云存储相比本地存储的主要优势是？",
    options: ["完全免费", "随时随地访问、易于备份共享", "速度一定更快", "不需要网络"],
    answer: 1,
  },
  {
    subject: "IT114115 · 云端运算",
    question: "按使用量计费（Pay-as-you-go）属于云的？",
    options: ["可度量服务", "固定成本", "一次性买断", "无计费"],
    answer: 0,
  },
  {
    subject: "IT114115 · 云端运算",
    question: "多租户（Multi-tenancy）指？",
    options: ["多个房东", "多用户共享同一套资源、彼此隔离", "单用户独占", "多台打印机"],
    answer: 1,
  },
  {
    subject: "IT114115 · 云端运算",
    question: "下列哪项是 PaaS 的典型服务？",
    options: ["AWS EC2", "Heroku 应用平台", "Dropbox", "Outlook 邮箱"],
    answer: 1,
  },
  {
    subject: "IT114115 · 云端运算",
    question: "云计算中「按需自助服务」指？",
    options: ["用户无需联系供应商即可开通资源", "由管理员代为操作", "只能按月购买", "必须现场办理"],
    answer: 0,
  },
  {
    subject: "IT114115 · 云端运算",
    question: "下列哪项不是云端运算的服务模式？",
    options: ["IaaS", "PaaS", "SaaS", "HaaS（硬件即服务）"],
    answer: 3,
  },
  {
    subject: "IT114115 · 云端运算",
    question: "私有云的部署位置通常是？",
    options: ["公共互联网", "企业内部或托管机房", "个人手机", "图书馆"],
    answer: 1,
  },
  {
    subject: "IT114115 · 云端运算",
    question: "容器化（如 Docker）在云中的作用是？",
    options: ["加密邮件", "轻量打包与运行应用", "播放视频", "排版文档"],
    answer: 1,
  },
  {
    subject: "IT114115 · 云端运算",
    question: "云端数据备份主要解决？",
    options: ["网速慢", "数据丢失风险", "屏幕闪烁", "键盘卡顿"],
    answer: 1,
  },
  {
    subject: "IT114115 · 云端运算",
    question: "云计算的「广域网络访问」指？",
    options: ["只能校内访问", "通过标准网络随处访问", "必须用专线", "只能用蓝牙"],
    answer: 1,
  },
];

export const QUESTION_TIME = 15;
export const MAX_HP = 3;

export function scoreToRank(score, count = QUIZ_QUESTIONS.length) {
  const max = count * (100 + QUESTION_TIME * 10) * 5;
  const ratio = score / max;
  if (ratio >= 0.8) return { rank: "S", label: "LEGENDARY ACE" };
  if (ratio >= 0.6) return { rank: "A", label: "ACE PILOT" };
  if (ratio >= 0.4) return { rank: "B", label: "VETERAN" };
  if (ratio >= 0.2) return { rank: "C", label: "ROOKIE" };
  return { rank: "D", label: "CADET" };
}