import Link from "next/link";
import EntryRow from "@/components/EntryRow";
import NoDatabase from "@/components/NoDatabase";
import { hasDatabase } from "@/lib/db";
import { expenseTotals, formatSum, listEntries, type Totals } from "@/lib/finance";

export const dynamic = "force-dynamic";

function Period({ title, t }: { title: string; t: Totals }) {
  if (t.count === 0) {
    return (
      <div className="card empty period">
        <div className="page-sub">{title}</div>
        <div className="nodata">нет данных</div>
        <div className="page-sub">расходов не внесено</div>
      </div>
    );
  }
  return (
    <div className="card period">
      <div className="page-sub">{title}</div>
      <div className="big">{formatSum(t.total)}</div>
      <div className="page-sub">
        Личные {formatSum(t.personal)} · Бизнес {formatSum(t.business)}
      </div>
      <div className="page-sub">записей: {t.count}</div>
    </div>
  );
}

export default async function FinancePage() {
  const dbReady = hasDatabase();
  let totals: Awaited<ReturnType<typeof expenseTotals>> | null = null;
  let recent: Awaited<ReturnType<typeof listEntries>> = [];
  let failed = false;

  if (dbReady) {
    try {
      [totals, recent] = await Promise.all([expenseTotals(), listEntries(30)]);
    } catch {
      failed = true;
    }
  }
  const expenses = recent.filter((e) => e.type === "expense").slice(0, 10);

  return (
    <>
      <header className="header-center">
        <h1 className="page-title">Финансы</h1>
        <div className="page-sub">Расходы</div>
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
            <Period title="Эта неделя" t={totals.week} />
            <Period title="Этот месяц" t={totals.month} />
          </div>
          <p className="hint">Считается только то, что вы внесли. Не внесённый расход не превращается в ноль.</p>

          <Link href="/new-expense" className="btn" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            Новый расход
          </Link>

          <section className="list" aria-label="Последние расходы">
            <h2 className="day">Последние расходы</h2>
            {expenses.length === 0 ? (
              <div className="card empty">Расходов пока нет.</div>
            ) : (
              expenses.map((e) => <EntryRow key={e.id} entry={e} />)
            )}
          </section>
        </>
      ) : null}
    </>
  );
}
