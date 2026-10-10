export default function NoDatabase() {
  return (
    <section className="card empty" role="status">
      База данных не подключена. Добавьте переменную <b>DATABASE_URL</b> в Railway
      (Variables) и перезапустите сервис.
    </section>
  );
}
