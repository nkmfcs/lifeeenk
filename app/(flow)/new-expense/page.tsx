import Link from "next/link";
import { createExpense } from "@/app/actions";
import { ACCOUNTS, CATEGORIES, nowLocalInput } from "@/lib/finance";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  amount: "Введите сумму числом, больше нуля.",
  category: "Выберите категорию или впишите свою.",
  date: "Проверьте дату и время.",
  save: "Не удалось сохранить. Проверьте подключение к базе и попробуйте ещё раз.",
};

export default async function NewExpensePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <div className="flow-head">
        <h1 className="page-title">Новый расход</h1>
        <Link href="/finance" className="close" aria-label="Закрыть">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>
      </div>

      {error && ERRORS[error] ? <div className="error" role="alert">{ERRORS[error]}</div> : null}

      <form action={createExpense} className="form">
        <div className="amount">
          <label htmlFor="amount">Сумма</label>
          <div className="amount-row">
            <input
              id="amount"
              name="amount"
              inputMode="numeric"
              autoComplete="off"
              placeholder="0"
              required
              autoFocus
            />
            <span>сум</span>
          </div>
        </div>

        <fieldset className="seg">
          <legend className="sr">Чей расход</legend>
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
          {CATEGORIES.map((c, i) => (
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

        <div className="field">
          <label htmlFor="when">Когда</label>
          <input id="when" name="when" type="datetime-local" className="input" defaultValue={nowLocalInput()} required />
        </div>

        <div className="field">
          <label htmlFor="description">Описание</label>
          <input id="description" name="description" className="input" maxLength={200} autoComplete="off" />
        </div>

        <button type="submit" className="btn">Сохранить расход</button>
      </form>
    </>
  );
}
