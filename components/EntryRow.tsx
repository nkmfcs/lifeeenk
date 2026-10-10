import { removeEntry } from "@/app/actions";
import { formatSum, formatTime, type Entry } from "@/lib/finance";

export default function EntryRow({ entry }: { entry: Entry }) {
  const d = entry.data;
  const isExpense = entry.type === "expense";
  const isIncome = entry.type === "income";
  const isTransfer = entry.type === "transfer";
  const description = String(d.description ?? "");

  let title: string = entry.type;
  let note = "";
  let account = "";

  if (isExpense || isIncome) {
    title = String(d.category ?? (isIncome ? "Доход" : "Расход"));
    note = description;
    account = String(d.account ?? "");
  } else if (isTransfer) {
    title = "Перевод";
    note = [`${d.from ?? "?"} → ${d.to ?? "?"}`, description].filter(Boolean).join(" · ");
  }

  const meta = [formatTime(entry.occurredAt), account].filter(Boolean).join(" · ");

  return (
    <div className="row">
      <div className="row-main">
        <div className="row-title">{title}</div>
        {note ? <div className="row-note">{note}</div> : null}
        <div className="row-meta">
          {meta}
          {isExpense || isIncome ? (
            <span className={`badge ${d.scope === "business" ? "biz" : ""}`}>
              {d.scope === "business" ? "Бизнес" : "Личный"}
            </span>
          ) : null}
          {isTransfer ? <span className="badge">не доход и не расход</span> : null}
        </div>
      </div>

      <div className="row-side">
        {isExpense ? <div className="row-amount">−{formatSum(Number(d.amount))}</div> : null}
        {isIncome ? <div className="row-amount plus">+{formatSum(Number(d.amount))}</div> : null}
        {isTransfer ? <div className="row-amount">{formatSum(Number(d.amount))}</div> : null}
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
