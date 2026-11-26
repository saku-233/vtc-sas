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
      <h3 className="font-heading text-lg text-foreground">Sync to VTC Moodle / phone calendar</h3>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Below is an iCalendar (.ics) subscription feed. Paste the link into VTC Moodle's "Subscribe to external calendar", or add it as a subscribed calendar on iPhone / Google Calendar, and you'll get a reminder 15 minutes before each class.
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
          Download .ics file
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
        >
          {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          {copied ? "Subscription link copied" : "Copy subscription link"}
        </button>
      </div>

      <ol className="mt-5 space-y-1.5 text-sm text-muted-foreground">
        <li>1. In Moodle, go to "Calendar → Import calendar / Subscribe to external calendar".</li>
        <li>2. Choose "Subscribe from URL", paste the copied link and save.</li>
      </ol>

      <p className="mt-4 text-xs text-muted-foreground/80">
        Tip: the subscription link needs a public URL to be read by Moodle or a phone calendar, so publish the app first; downloading the .ics works in the preview.
      </p>
    </section>
  );
}