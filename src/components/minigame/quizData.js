export const QUIZ_QUESTIONS = [
  {
    subject: "IT114115 · Programming Basics",
    question: "Which of the following is a valid integer literal?",
    options: ["3.14a", "08", "0x1F", "1_000."],
    answer: 2,
  },
  {
    subject: "IT114115 · Data Types",
    question: "Which data type stores a true/false value?",
    options: ["int", "boolean", "char", "double"],
    answer: 1,
  },
  {
    subject: "IT114115 · Number Systems",
    question: "Binary 1011 equals which decimal value?",
    options: ["9", "11", "13", "15"],
    answer: 1,
  },
  {
    subject: "IT114115 · Number Systems",
    question: "Hexadecimal 1F equals which decimal value?",
    options: ["15", "31", "33", "63"],
    answer: 1,
  },
  {
    subject: "IT114115 · Boolean Logic",
    question: "What is NOT (TRUE AND FALSE)?",
    options: ["TRUE", "FALSE", "Undefined", "Syntax error"],
    answer: 0,
  },
  {
    subject: "IT114115 · Control Flow",
    question: "A for loop is typically used for?",
    options: ["Running once", "Repeating a known number of times", "Infinite loops", "Conditional branching"],
    answer: 1,
  },
  {
    subject: "IT114115 · Control Flow",
    question: "An if statement's condition must be a?",
    options: ["Integer", "String", "Boolean", "Array"],
    answer: 2,
  },
  {
    subject: "IT114115 · Functions",
    question: "A function's \"parameters\" refer to?",
    options: ["The return value", "Data passed in when called", "The function name", "The loop count"],
    answer: 1,
  },
  {
    subject: "IT114115 · Arrays",
    question: "Array indices usually start at?",
    options: ["1", "0", "-1", "Random"],
    answer: 1,
  },
  {
    subject: "IT114115 · Algorithms",
    question: "In a flowchart, a diamond shape represents?",
    options: ["Start/End", "A process step", "A decision", "Input/Output"],
    answer: 2,
  },
  {
    subject: "IT114115 · Cloud Computing",
    question: "What is a core characteristic of cloud computing?",
    options: ["Runs only locally", "On-demand self-service, elastic scaling", "Requires buying hardware", "Offline single-machine use"],
    answer: 1,
  },
  {
    subject: "IT114115 · Cloud Computing",
    question: "What does IaaS provide?",
    options: ["Complete applications", "Virtual computing infrastructure", "A development platform", "Database as a service"],
    answer: 1,
  },
  {
    subject: "IT114115 · Cloud Computing",
    question: "PaaS is mainly aimed at which users?",
    options: ["End users", "Developers", "Hardware admins", "Finance staff"],
    answer: 1,
  },
  {
    subject: "IT114115 · Cloud Computing",
    question: "Which is a typical example of SaaS?",
    options: ["Virtual machines", "Cloud storage", "Online office documents", "Load balancers"],
    answer: 2,
  },
  {
    subject: "IT114115 · Cloud Computing",
    question: "What is a key feature of public cloud?",
    options: ["For internal company use only", "Operated by a third party, multi-tenant shared", "Deployed in a local server room", "Not networked"],
    answer: 1,
  },
  {
    subject: "IT114115 · Cloud Computing",
    question: "What is the main purpose of virtualization?",
    options: ["Encrypting data", "Running multiple virtual environments on one physical machine", "Speeding up the network", "Compressing files"],
    answer: 1,
  },
  {
    subject: "IT114115 · Cloud Computing",
    question: "\"Elasticity\" in cloud services means?",
    options: ["Skinnable UI", "Resources scale dynamically with demand", "Fixed pricing", "One-year commitment only"],
    answer: 1,
  },
  {
    subject: "IT114115 · Cloud Computing",
    question: "Which of the following is an IaaS service?",
    options: ["Azure Virtual Machines", "Gmail", "Google Docs", "Microsoft 365"],
    answer: 0,
  },
  {
    subject: "IT114115 · Cloud Computing",
    question: "A hybrid cloud is?",
    options: ["Only public cloud", "A mix of public and private cloud", "Multiple phones", "Offline computers"],
    answer: 1,
  },
  {
    subject: "IT114115 · Cloud Computing",
    question: "What is a main advantage of cloud storage over local storage?",
    options: ["Completely free", "Access anywhere, easy backup and sharing", "Always faster", "No network needed"],
    answer: 1,
  },
  {
    subject: "IT114115 · Cloud Computing",
    question: "Pay-as-you-go billing belongs to which cloud trait?",
    options: ["Measured service", "Fixed cost", "One-time purchase", "No billing"],
    answer: 0,
  },
  {
    subject: "IT114115 · Cloud Computing",
    question: "Multi-tenancy means?",
    options: ["Multiple landlords", "Multiple users share the same resources, isolated from each other", "Single-user exclusive", "Multiple printers"],
    answer: 1,
  },
  {
    subject: "IT114115 · Cloud Computing",
    question: "Which is a typical PaaS service?",
    options: ["AWS EC2", "Heroku app platform", "Dropbox", "Outlook email"],
    answer: 1,
  },
  {
    subject: "IT114115 · Cloud Computing",
    question: "\"On-demand self-service\" in cloud means?",
    options: ["Users provision resources without contacting the provider", "Admins operate on their behalf", "Monthly purchase only", "On-site processing required"],
    answer: 0,
  },
  {
    subject: "IT114115 · Cloud Computing",
    question: "Which is NOT a cloud service model?",
    options: ["IaaS", "PaaS", "SaaS", "HaaS (Hardware as a Service)"],
    answer: 3,
  },
  {
    subject: "IT114115 · Cloud Computing",
    question: "Where is a private cloud usually deployed?",
    options: ["The public internet", "Inside an enterprise or hosted data center", "A personal phone", "A library"],
    answer: 1,
  },
  {
    subject: "IT114115 · Cloud Computing",
    question: "What does containerization (e.g. Docker) do in the cloud?",
    options: ["Encrypt email", "Lightweight packaging and running of applications", "Play video", "Format documents"],
    answer: 1,
  },
  {
    subject: "IT114115 · Cloud Computing",
    question: "What does cloud data backup mainly address?",
    options: ["Slow network", "Risk of data loss", "Screen flicker", "Keyboard lag"],
    answer: 1,
  },
  {
    subject: "IT114115 · Cloud Computing",
    question: "\"Broad network access\" in cloud means?",
    options: ["Campus-only access", "Access from anywhere over standard networks", "Dedicated lines only", "Bluetooth only"],
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