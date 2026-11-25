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

const STATUSES = ["未开始", "进行中", "已提交", "已评分"];

const emptyForm = {
  courseCode: "",
  title: "",
  type: "",
  weight: "",
  due: "",
  status: "未开始",
  note: "",
};

function rowDraft(original) {
  return {
    courseCode: original.courseCode ?? "",
    title: original.title ?? "",
    type: original.type ?? "",
    weight: original.weight ?? "",
    due: original.due ?? "",
    status: original.status ?? "未开始",
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
      toast("请先选择截止日期");
      return;
    }
    if (selected.size === 0) {
      toast("请先勾选作业");
      return;
    }
    setDrafts((prev) => {
      const next = { ...prev };
      selected.forEach((id) => {
        next[id] = { ...(next[id] ?? rowDraft(assignments.find((a) => a.id === id))), due: batchDue };
      });
      return next;
    });
    toast(`已为 ${selected.size} 项设置截止日期`);
  }

  function applyBatchStatus() {
    if (!batchStatus) {
      toast("请先选择状态");
      return;
    }
    if (selected.size === 0) {
      toast("请先勾选作业");
      return;
    }
    setDrafts((prev) => {
      const next = { ...prev };
      selected.forEach((id) => {
        next[id] = { ...(next[id] ?? rowDraft(assignments.find((a) => a.id === id))), status: batchStatus };
      });
      return next;
    });
    toast(`已为 ${selected.size} 项设置状态：${batchStatus}`);
  }

  async function saveAll() {
    if (changedIds.length === 0) {
      toast("没有需要保存的更改");
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
      toast.success(`已保存 ${items.length} 项更改`);
      setDrafts({});
      await router.invalidate();
    } catch (err) {
      toast.error(err.message || "保存失败");
    } finally {
      setBusy(false);
    }
  }

  async function publishSelected() {
    if (selected.size === 0) {
      toast("请先勾选要发布的作业");
      return;
    }
    setBusy(true);
    try {
      const rows = sorted.filter((a) => selected.has(a.id));
      // 发布：把所选作业状态设为「进行中」并保存
      const items = rows.map((a) => {
        const d = drafts[a.id] ?? rowDraft(a);
        return {
          id: a.id,
          courseCode: d.courseCode,
          title: d.title,
          type: d.type || undefined,
          weight: d.weight === "" ? undefined : Number(d.weight),
          due: d.due || undefined,
          status: "进行中",
          note: d.note || undefined,
        };
      });
      await bulkUpdateFn({ data: { items } });
      toast.success(`已发布 ${items.length} 项作业`);
      setSelected(new Set());
      setDrafts({});
      await router.invalidate();
    } catch (err) {
      toast.error(err.message || "发布失败");
    } finally {
      setBusy(false);
    }
  }

  async function removeSelected() {
    if (selected.size === 0) {
      toast("请先勾选要删除的作业");
      return;
    }
    if (!confirm(`确认删除 ${selected.size} 项作业？此操作不可撤销。`)) return;
    setBusy(true);
    try {
      await bulkDeleteFn({ data: { ids: [...selected] } });
      toast.success(`已删除 ${selected.size} 项作业`);
      setSelected(new Set());
      setDrafts({});
      await router.invalidate();
    } catch (err) {
      toast.error(err.message || "删除失败");
    } finally {
      setBusy(false);
    }
  }

  async function createOne(e) {
    e.preventDefault();
    if (!form.courseCode) {
      toast("请选择课程");
      return;
    }
    if (!form.title.trim()) {
      toast("请输入作业标题");
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
      toast.success("作业已创建");
      setForm(emptyForm);
      await router.invalidate();
    } catch (err) {
      toast.error(err.message || "创建失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* 新增作业 */}
      <form onSubmit={createOne} className="rounded-2xl border border-border/80 bg-card p-5">
        <div className="flex items-center gap-2 text-foreground">
          <Plus className="h-4 w-4 text-primary" />
          <h3 className="font-heading text-base">新增作业</h3>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs">课程</Label>
            <Select value={form.courseCode} onValueChange={(v) => setForm({ ...form, courseCode: v })}>
              <SelectTrigger className="h-10"><SelectValue placeholder="选择课程" /></SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.code} value={c.code}>{c.code} · {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">作业标题</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="例如：单元三习题" className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">类型</Label>
            <Input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="作业 / 测验 / 专题" className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">占总评 (%)</Label>
            <Input type="number" min="0" max="100" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">截止日期</Label>
            <Input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">状态</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs">备注</Label>
            <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="可选" className="h-10" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={busy}>
            <Plus className="mr-1.5 h-4 w-4" /> 创建作业
          </Button>
        </div>
      </form>

      {/* 批量工具栏 */}
      <div className="rounded-2xl border border-border/80 bg-card p-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>已选 <strong className="text-foreground">{selected.size}</strong> / {sorted.length}</span>
            {changedIds.length > 0 && <span className="text-amber-600">· 有 {changedIds.length} 项未保存</span>}
          </div>
          <div className="flex flex-1 flex-wrap items-center gap-2 justify-end">
            <Button type="button" variant="outline" size="sm" onClick={toggleAll}>
              {selected.size === sorted.length && sorted.length > 0 ? <Square className="mr-1.5 h-3.5 w-3.5" /> : <CheckSquare className="mr-1.5 h-3.5 w-3.5" />}
              全选/取消
            </Button>
            <div className="flex items-center gap-1.5">
              <Input type="date" value={batchDue} onChange={(e) => setBatchDue(e.target.value)} className="h-9 w-[150px]" />
              <Button type="button" variant="outline" size="sm" onClick={applyBatchDue}>套用截止</Button>
            </div>
            <div className="flex items-center gap-1.5">
              <Select value={batchStatus} onValueChange={setBatchStatus}>
                <SelectTrigger className="h-9 w-[120px]"><SelectValue placeholder="状态" /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" size="sm" onClick={applyBatchStatus}>套用状态</Button>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={saveAll} disabled={busy || changedIds.length === 0}>
              <Save className="mr-1.5 h-3.5 w-3.5" /> 保存更改
            </Button>
            <Button type="button" size="sm" onClick={publishSelected} disabled={busy || selected.size === 0}>
              <Send className="mr-1.5 h-3.5 w-3.5" /> 发布所选
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={removeSelected} disabled={busy || selected.size === 0}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> 删除所选
            </Button>
          </div>
        </div>
      </div>

      {/* 作业表格 */}
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">还没有发布作业，使用上方表单新增。</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
              <tr>
                <th className="w-10 px-3 py-3" />
                <th className="px-3 py-3 font-medium">课程</th>
                <th className="px-3 py-3 font-medium">标题</th>
                <th className="px-3 py-3 font-medium">类型</th>
                <th className="px-3 py-3 font-medium">占比</th>
                <th className="px-3 py-3 font-medium">截止</th>
                <th className="px-3 py-3 font-medium">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {sorted.map((a) => {
                const course = courseByCode[draftValue(a, "courseCode")] ?? courseByCode[a.courseCode];
                return (
                  <tr key={a.id} className={selected.has(a.id) ? "bg-accent/40" : ""}>
                    <td className="px-3 py-2 align-middle">
                      <Checkbox checked={selected.has(a.id)} onCheckedChange={() => toggle(a.id)} aria-label="选择此作业" />
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