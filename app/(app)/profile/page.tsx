export default function ProfilePage() {
  return (
    <>
      <h1 className="page-title">Профиль</h1>

      <section className="card" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Сардор</div>
        <div className="page-sub">Ташкент · Asia/Tashkent</div>
      </section>

      <section className="card empty">
        Настройки (язык, валюта, тема, GPS, отправка данных в AI) появятся здесь.
        По умолчанию GPS и отправка данных в AI выключены.
      </section>

      <form action="/api/logout" method="post">
        <button type="submit" className="btn ghost">
          Выйти
        </button>
      </form>
    </>
  );
}
