export const dynamic = "force-dynamic";

export default function HomePage() {
  const date = new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Tashkent",
  }).format(new Date());

  return (
    <>
      <header className="header-center">
        <div className="avatar" aria-hidden="true">С</div>
        <h1 className="page-title">Сегодня</h1>
        <div className="page-sub">{date}</div>
      </header>

      <section className="card empty">
        Записей пока нет. Здесь появятся расходы, сон, тренировки и заметки за
        сегодня. Сначала подключим базу и первый модуль — финансы.
      </section>
    </>
  );
}
