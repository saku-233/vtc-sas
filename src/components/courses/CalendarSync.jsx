import { useEffect, useState } from "react";
import { Check, Download, Link2 } from "lucide-react";

const PATH = "/api/timetable";

export default function CalendarSync() {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const feedUrl = origin ? `${origin}${PATH}` : PATH;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border/80 bg-card p-6">
      <h3 className="font-heading text-lg text-foreground">同步到 VTC Moodle / 手机日历</h3>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        下方是一个 iCalendar (.ics) 订阅源。在 VTC Moodle 的日历「订阅外部日历」粘贴订阅链接，或直接在 iPhone / Google 日历添加订阅日历，上课前 15 分钟即可收到提醒。
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={PATH}
          download="vtc-timetable.ics"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Download className="h-4 w-4" />
          下载 .ics 文件
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
        >
          {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          {copied ? "已复制订阅链接" : "复制订阅链接"}
        </button>
      </div>

      <ol className="mt-5 space-y-1.5 text-sm text-muted-foreground">
        <li>1. 在 Moodle 进入「日历 → 导入日历 / 订阅外部日历」。</li>
        <li>2. 选择「从 URL 订阅」，粘贴复制的链接，保存即可。</li>
      </ol>

      <p className="mt-4 text-xs text-muted-foreground/80">
        提示：订阅链接需公开网址才能被 Moodle 或手机日历读取，请先发布应用；下载 .ics 可在预览中直接使用。
      </p>
    </section>
  );
}