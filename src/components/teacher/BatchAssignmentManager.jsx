import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  bulkCreateAssignments,
  bulkDeleteAssignments,
  bulkUpdateAssignments,
  createAssignment,
} from "@/lib/server-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Save, Trash2, Send, CheckSquare, Square } from "lucide-react";

const STATUSES = ["Not Started", "In Progress", "Submitted", "Graded"];

const emptyForm = {
  courseCode: "",
  title: "",
  type: "",
  weight: "",
  due: "",
  status: "Not Started",
  note: "",
};

function rowDraft(original) {
  return {
    courseCode: original.courseCode ?? "",
    title: original.title ?? "",
    type: original.type ?? "",
    weight: original.weight ?? "",
    due: original.due ?? "",
    status: original.status ?? "Not Started",
    note: original.note ?? "",
  };
}

export default function BatchAssignmentManager({ assignments, courses }) {
  const router = useRouter();
  const createFn = useServerFn(createAssignment);
  const bulkCreateFn = useServerFn(bulkCreateAssignments);
  const bulkUpdateFn = useServerFn(bulkUpdateAssignments);
  const bulkDeleteFn = useServerFn(bulkDeleteAssignments);

  const [form, setForm] = useState(emptyForm);
  const [drafts, setDrafts] = useState({});
  const [selected, setSelected] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const [batchDue, setBatchDue] = useState("");
  const [batchStatus, setBatchStatus] = useState("");

  const courseByCode = useMemo(
    () => Object.fromEntries(courses.map((c) => [c.code, c])),
    [courses]
  );

  const sorted = useMemo(
    () => [...assignments].sort((a, b) => (a.due ?? "").localeCompare(b.due ?? "")),
    [assignments]
  );

  const changedIds = useMemo(
    () =>
      sorted
        .filter((a) => {
          const d = drafts[a.id];
          if (!d) return false;
          const base = rowDraft(a);
          return Object.keys(base).some((k) => String(d[k] ?? "") !== String(base[k] ?? ""));
        })
        .map((a) => a.id),
    [sorted, drafts]
  );

  function updateDraft(id, field, value) {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? rowDraft(assignments.find((a) => a.id === id))), [field]: value },
    }));
  }

  function draftValue(a, field) {
    return drafts[a.id]?.[field] ?? rowDraft(a)[field];
  }

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      if (prev.size === sorted.length) return new Set();
      return new Set(sorted.map((a) => a.id));
    });
  }

  function applyBatchDue() {
    if (!batchDue) {
      toast("Pick a due date first");
      return;
    }
    if (selected.size === 0) {
      toast("Select assignments first");
      return;
    }
    setDrafts((prev) => {
      const next = { ...prev };
      selected.forEach((id) => {
        next[id] = { ...(next[id] ?? rowDraft(assignments.find((a) => a.id === id))), due: batchDue };
      });
      return next;
    });
    toast(`Set due date for ${selected.size} items`);
  }

  function applyBatchStatus() {
    if (!batchStatus) {
      toast("Pick a status first");
      return;
    }
    if (selected.size === 0) {
      toast("Select assignments first");
      return;
    }
    setDrafts((prev) => {
      const next = { ...prev };
      selected.forEach((id) => {
        next[id] = { ...(next[id] ?? rowDraft(assignments.find((a) => a.id === id))), status: batchStatus };
      });
      return next;
    });
    toast(`Set status for ${selected.size} items: ${batchStatus}`);
  }

  async function saveAll() {
    if (changedIds.length === 0) {
      toast("No changes to save");
      return;
    }
    setBusy(true);
    try {
      const items = changedIds.map((id) => {
        const d = drafts[id];
        return {
          id,
          courseCode: d.courseCode,
          title: d.title,
          type: d.type || undefined,
          weight: d.weight === "" ? undefined : Number(d.weight),
          due: d.due || undefined,
          status: d.status,
          note: d.note || undefined,
        };
      });
      await bulkUpdateFn({ data: { items } });
      toast.success(`Saved ${items.length} changes`);
      setDrafts({});
      await router.invalidate();
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function publishSelected() {
    if (selected.size === 0) {
      toast("Select assignments to publish first");
      return;
    }
    setBusy(true);
    try {
      const rows = sorted.filter((a) => selected.has(a.id));
      // Publish: set selected assignments to "In Progress" and save
      const items = rows.map((a) => {
        const d = drafts[a.id] ?? rowDraft(a);
        return {
          id: a.id,
          courseCode: d.courseCode,
          title: d.title,
          type: d.type || undefined,
          weight: d.weight === "" ? undefined : Number(d.weight),
          due: d.due || undefined,
          status: "In Progress",
          note: d.note || undefined,
        };
      });
      await bulkUpdateFn({ data: { items } });
      toast.success(`Published ${items.length} assignments`);
      setSelected(new Set());
      setDrafts({});
      await router.invalidate();
    } catch (err) {
      toast.error(err.message || "Publish failed");
    } finally {
      setBusy(false);
    }
  }

  async function removeSelected() {
    if (selected.size === 0) {
      toast("Select assignments to delete first");
      return;
    }
    if (!confirm(`Delete ${selected.size} assignments? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await bulkDeleteFn({ data: { ids: [...selected] } });
      toast.success(`Deleted ${selected.size} assignments`);
      setSelected(new Set());
      setDrafts({});
      await router.invalidate();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function createOne(e) {
    e.preventDefault();
    if (!form.courseCode) {
      toast("Pick a course");
      return;
    }
    if (!form.title.trim()) {
      toast("Enter an assignment title");
      return;
    }
    setBusy(true);
    try {
      await createFn({
        data: {
          courseCode: form.courseCode,
          title: form.title.trim(),
          type: form.type || undefined,
          weight: form.weight === "" ? undefined : Number(form.weight),
          due: form.due || undefined,
          status: form.status,
          note: form.note || undefined,
        },
      });
      toast.success("Assignment created");
      setForm(emptyForm);
      await router.invalidate();
    } catch (err) {
      toast.error(err.message || "Create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* New assignment */}
      <form onSubmit={createOne} className="rounded-2xl border border-border/80 bg-card p-5">
        <div className="flex items-center gap-2 text-foreground">
          <Plus className="h-4 w-4 text-primary" />
          <h3 className="font-heading text-base">New assignment</h3>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Course</Label>
            <Select value={form.courseCode} onValueChange={(v) => setForm({ ...form, courseCode: v })}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Select course" /></SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.code} value={c.code}>{c.code} · {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Assignment title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Unit 3 exercises" className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Type</Label>
            <Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Assignment / Quiz / Project" className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Weight (%)</Label>
            <Input type="number" min="0" max="100" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Due date</Label>
            <Input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs">Note</Label>
            <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Optional" className="h-10" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={busy}>
            <Plus className="mr-1.5 h-4 w-4" /> Create assignment
          </Button>
        </div>
      </form>

      {/* Batch toolbar */}
      <div className="rounded-2xl border border-border/80 bg-card p-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Selected <strong className="text-foreground">{selected.size}</strong> / {sorted.length}</span>
            {changedIds.length > 0 && <span className="text-amber-600">· {changedIds.length} unsaved</span>}
          </div>
          <div className="flex flex-1 flex-wrap items-center gap-2 justify-end">
            <Button type="button" variant="outline" size="sm" onClick={toggleAll}>
              {selected.size === sorted.length && sorted.length > 0 ? <Square className="mr-1.5 h-3.5 w-3.5" /> : <CheckSquare className="mr-1.5 h-3.5 w-3.5" />}
              Select all / none
            </Button>
            <div className="flex items-center gap-1.5">
              <Input type="date" value={batchDue} onChange={(e) => setBatchDue(e.target.value)} className="h-9 w-[150px]" />
              <Button type="button" variant="outline" size="sm" onClick={applyBatchDue}>Apply due</Button>
            </div>
            <div className="flex items-center gap-1.5">
              <Select value={batchStatus} onValueChange={setBatchStatus}>
                <SelectTrigger className="h-9 w-[120px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" size="sm" onClick={applyBatchStatus}>Apply status</Button>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={saveAll} disabled={busy || changedIds.length === 0}>
              <Save className="mr-1.5 h-3.5 w-3.5" /> Save changes
            </Button>
            <Button type="button" size="sm" onClick={publishSelected} disabled={busy || selected.size === 0}>
              <Send className="mr-1.5 h-3.5 w-3.5" /> Publish selected
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={removeSelected} disabled={busy || selected.size === 0}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete selected
            </Button>
          </div>
        </div>
      </div>

      {/* Assignment table */}
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">No assignments yet — use the form above to add one.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th className="w-10 px-3 py-3" />
                <th className="px-3 py-3 font-medium">Course</th>
                <th className="px-3 py-3 font-medium">Title</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-3 py-3 font-medium">Weight</th>
                <th className="px-3 py-3 font-medium">Due</th>
                <th className="px-3 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {sorted.map((a) => {
                const course = courseByCode[draftValue(a, "courseCode")] ?? courseByCode[a.courseCode];
                return (
                  <tr key={a.id} className={selected.has(a.id) ? "bg-accent/40" : ""}>
                    <td className="px-3 py-2 align-middle">
                      <Checkbox checked={selected.has(a.id)} onCheckedChange={() => toggle(a.id)} aria-label="Select this assignment" />
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <Select value={draftValue(a, "courseCode")} onValueChange={(v) => updateDraft(a.id, "courseCode", v)}>
                        <SelectTrigger className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {courses.map((c) => <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <span className="mt-1 block truncate text-[11px] text-muted-foreground">{course?.name}</span>
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <Input value={draftValue(a, "title")} onChange={(e) => updateDraft(a.id, "title", e.target.value)} className="h-9 w-[200px]" />
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <Input value={draftValue(a, "type")} onChange={(e) => updateDraft(a.id, "type", e.target.value)} className="h-9 w-[120px]" />
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <Input type="number" min="0" max="100" value={draftValue(a, "weight")} onChange={(e) => updateDraft(a.id, "weight", e.target.value)} className="h-9 w-[80px]" />
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <Input type="date" value={draftValue(a, "due")} onChange={(e) => updateDraft(a.id, "due", e.target.value)} className="h-9 w-[150px]" />
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <Select value={draftValue(a, "status")} onValueChange={(v) => updateDraft(a.id, "status", v)}>
                        <SelectTrigger className="h-9 w-[110px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}