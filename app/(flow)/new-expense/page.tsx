import Link from "next/link";
import { createEntry } from "@/app/actions";
import {
  ACCOUNTS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  entryTypeFrom,
  nowLocalInput,
} from "@/lib/finance";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  amount: "Введите сумму числом, больше нуля.",
  category: "Выберите категорию или впишите свою.",
  date: "Проверьте дату и время.",
  accounts: "Счета должны быть разными: перевод с одного счёта на тот же ничего не меняет.",
  save: "Не удалось сохранить. Проверьте подключение к базе и попробуйте ещё раз.",
};

const TABS = [
  { type: "expense", label: "Расход" },
  { type: "income", label: "Доход" },
  { type: "transfer", label: "Перевод" },
] as const;

const TITLES = { expense: "Новый расход", income: "Новый доход", transfer: "Новый перевод" } as const;
const SUBMIT = { expense: "Сохранить расход", income: "Сохранить доход", transfer: "Сохранить перевод" } as const;

export default async function NewEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; type?: string }>;
}) {
  const sp = await searchParams;
  const type = entryTypeFrom(sp.type);
  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <>
      <div className="flow-head">
        <h1 className="page-title">{TITLES[type]}</h1>
        <Link href="/finance" className="close" aria-label="Закрыть">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>
      </div>

      <nav className="tabs" aria-label="Тип записи">
        {TABS.map((t) => (
          <Link
            key={t.type}
            href={`/new-expense?type=${t.type}`}
            aria-current={t.type === type ? "page" : undefined}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {sp.error && ERRORS[sp.error] ? <div className="error" role="alert">{ERRORS[sp.error]}</div> : null}

      {/* key заставляет форму сброситься при смене вкладки */}
      <form key={type} action={createEntry} className="form">
        <input type="hidden" name="type" value={type} />

        <div className="amount">
          <label htmlFor="amount">Сумма</label>
          <div className="amount-row">
            <input id="amount" name="amount" inputMode="numeric" autoComplete="off" placeholder="0" required autoFocus />
            <span>сум</span>
          </div>
        </div>

        {type !== "transfer" ? (
          <>
            <fieldset className="seg">
              <legend className="sr">Чей {type === "income" ? "доход" : "расход"}</legend>
              <label>
                <input type="radio" name="scope" value="personal" defaultChecked />
                <span>Личный</span>
              </label>
              <label>
                <input type="radio" name="scope" value="business" />
                <span>Бизнес</span>
              </label>
            </fieldset>

            <fieldset className="chips">
              <legend>Категория</legend>
              {categories.map((c, i) => (
                <label key={c} className="chip">
                  <input type="radio" name="category" value={c} defaultChecked={i === 0} />
                  <span>{c}</span>
                </label>
              ))}
            </fieldset>

            <div className="field">
              <label htmlFor="customCategory">Своя категория (необязательно)</label>
              <input id="customCategory" name="customCategory" className="input" maxLength={40} autoComplete="off" />
            </div>

            <fieldset className="chips">
              <legend>Счёт</legend>
              {ACCOUNTS.map((a, i) => (
                <label key={a} className="chip">
                  <input type="radio" name="account" value={a} defaultChecked={i === 0} />
                  <span>{a}</span>
                </label>
              ))}
            </fieldset>
          </>
        ) : (
          <>
            <fieldset className="chips">
              <legend>Откуда</legend>
              {ACCOUNTS.map((a, i) => (
                <label key={a} className="chip">
                  <input type="radio" name="from" value={a} defaultChecked={i === 0} />
                  <span>{a}</span>
                </label>
              ))}
            </fieldset>
            <fieldset className="chips">
              <legend>Куда</legend>
              {ACCOUNTS.map((a, i) => (
                <label key={a} className="chip">
                  <input type="radio" name="to" value={a} defaultChecked={i === 1} />
                  <span>{a}</span>
                </label>
              ))}
            </fieldset>
            <p className="hint">Перевод между своими счетами не считается ни доходом, ни расходом.</p>
          </>
        )}

        <div className="field">
          <label htmlFor="when">Когда</label>
          <input id="when" name="when" type="datetime-local" className="input" defaultValue={nowLocalInput()} required />
        </div>

        <div className="field">
          <label htmlFor="description">Описание</label>
          <input id="description" name="description" className="input" maxLength={200} autoComplete="off" />
        </div>

        <button type="submit" className="btn">{SUBMIT[type]}</button>
      </form>
    </>
  );
}
