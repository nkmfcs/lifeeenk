import { removeEntry } from "@/app/actions";
import { formatSum, formatTime, type Entry } from "@/lib/finance";

export default function EntryRow({ entry }: { entry: Entry }) {
  const d = entry.data;
  const isExpense = entry.type === "expense";

  const title = isExpense ? String(d.category ?? "Расход") : entry.type;
  const note = isExpense ? String(d.description ?? "") : "";
  const meta = [formatTime(entry.occurredAt), isExpense ? String(d.account ?? "") : ""]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="row">
      <div className="row-main">
        <div className="row-title">{title}</div>
        {note ? <div className="row-note">{note}</div> : null}
        <div className="row-meta">
          {meta}
          {isExpense ? (
            <span className={`badge ${d.scope === "business" ? "biz" : ""}`}>
              {d.scope === "business" ? "Бизнес" : "Личный"}
            </span>
          ) : null}
        </div>
      </div>

      <div className="row-side">
        {isExpense ? <div className="row-amount">−{formatSum(Number(d.amount))}</div> : null}
        <details className="more">
          <summary aria-label="Действия с записью">⋯</summary>
          <form action={removeEntry}>
            <input type="hidden" name="id" value={entry.id} />
            <button type="submit" className="danger">Удалить запись</button>
          </form>
        </details>
      </div>
    </div>
  );
}
