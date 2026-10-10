export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="login">
      <h1 className="page-title">LifeOS</h1>
      <div className="page-sub">Введите пароль, чтобы войти</div>
      {error ? <div className="error" role="alert">Неверный пароль</div> : null}
      <form action="/api/login" method="post" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label htmlFor="password" style={{ fontSize: 13, fontWeight: 600 }}>
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          autoComplete="current-password"
          required
          autoFocus
        />
        <button type="submit" className="btn">
          Войти
        </button>
      </form>
    </main>
  );
}
