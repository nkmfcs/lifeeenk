import Link from "next/link";
import EntryRow from "@/components/EntryRow";
import NoDatabase from "@/components/NoDatabase";
import { hasDatabase } from "@/lib/db";
import { formatSigned, formatSum, listEntries, periodTotals, type Period, type Totals } from "@/lib/finance";

export const dynamic = "force-dynamic";

function Line({ label, t, sign }: { label: string; t: Totals; sign: "−" | "+" }) {
  if (t.count === 0) {
    return (
      <div className="kv">
        <span className="k">{label}</span>
        <span className="v none">нет данных</span>
      </div>
    );
  }
  return (
    <div className="kv">
      <span className="k">{label}</span>
      <span className={`v ${sign === "+" ? "plus" : ""}`}>
        {sign}
        {formatSum(t.total)}
      </span>
      {t.personal > 0 && t.business > 0 ? (
        <span className="s">
          личные {formatSum(t.personal)} · бизнес {formatSum(t.business)}
        </span>
      ) : (
        <span className="s">{t.business > 0 ? "только бизнес" : "только личные"}</span>
      )}
    </div>
  );
}

function PeriodCard({ title, p }: { title: string; p: Period }) {
  const empty = p.expense.count === 0 && p.income.count === 0;
  // Разницу показываем только когда внесены и доходы, и расходы: иначе она вводит в заблуждение.
  const showNet = p.expense.count > 0 && p.income.count > 0;
  const net = p.income.total - p.expense.total;

  return (
    <div className={`card period ${empty ? "empty" : ""}`}>
      <div className="page-sub">{title}</div>
      <Line label="Расходы" t={p.expense} sign="−" />
      <Line label="Доходы" t={p.income} sign="+" />
      {showNet ? (
        <div className="kv net">
          <span className="k">Разница</span>
          <span className="v">{formatSigned(net)}</span>
        </div>
      ) : null}
    </div>
  );
}

export default async function FinancePage() {
  const dbReady = hasDatabase();
  let totals: Awaited<ReturnType<typeof periodTotals>> | null = null;
  let recent: Awaited<ReturnType<typeof listEntries>> = [];
  let failed = false;

  if (dbReady) {
    try {
      [totals, recent] = await Promise.all([periodTotals(), listEntries(30)]);
    } catch {
      failed = true;
    }
  }
  const items = recent.slice(0, 10);

  return (
    <>
      <header className="header-center">
        <h1 className="page-title">Финансы</h1>
        <div className="page-sub">Доходы и расходы</div>
      </header>

      {!dbReady ? <NoDatabase /> : null}
      {failed ? (
        <section className="card empty" role="alert">
          Не удалось прочитать данные. Проверьте строку подключения к базе.
        </section>
      ) : null}

      {totals ? (
        <>
          <div className="grid2">
            <PeriodCard title="Эта неделя" p={totals.week} />
            <PeriodCard title="Этот месяц" p={totals.month} />
          </div>
          <p className="hint">
            Считается только то, что вы внесли: не внесённое не превращается в ноль. Переводы между счетами в итоги не входят.
          </p>

          <Link href="/new-expense" className="btn" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            Новая запись
          </Link>

          <section className="list" aria-label="Последние записи">
            <h2 className="day">Последние записи</h2>
            {items.length === 0 ? (
              <div className="card empty">Записей пока нет.</div>
            ) : (
              items.map((e) => <EntryRow key={e.id} entry={e} />)
            )}
          </section>
        </>
      ) : null}
    </>
  );
}
