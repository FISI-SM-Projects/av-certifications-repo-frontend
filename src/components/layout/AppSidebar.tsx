const futureItems = ["Constancias", "Administración", "Configuración"];

export function AppSidebar() {
  return (
    <aside className="flex min-h-screen w-full flex-col border-r border-[var(--border)] bg-[var(--surface-muted)] text-sm text-[var(--text)] md:w-64">
      <div className="border-b border-[var(--border)] px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md border border-[var(--gold)] bg-[var(--surface-soft)] text-xs font-bold text-[var(--gold-soft)]">
            FISI
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--gold-soft)]">
              UNMSM
            </p>
            <h1 className="text-lg font-semibold leading-tight">Gestión Docente</h1>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-4 py-5">
        <section>
          <p className="mb-3 text-[11px] font-semibold uppercase text-[var(--muted)]">
            Sesión
          </p>
          <div className="rounded-md border border-[var(--border-soft)] bg-[var(--surface)] p-3">
            <p className="font-semibold">Juan Carlos Pérez</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Docente demo</p>
          </div>
        </section>

        <section>
          <p className="mb-3 text-[11px] font-semibold uppercase text-[var(--muted)]">
            Trabajo
          </p>
          <nav className="space-y-1">
            <a
              className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--green-soft)] px-3 py-2 font-medium text-[var(--text)]"
              href="/perfil-docente"
            >
              <span>Perfil Docente</span>
              <span className="rounded-full bg-[var(--gold)] px-2 py-0.5 text-[11px] font-bold text-[#142016]">
                activo
              </span>
            </a>

            {futureItems.map((item) => (
              <div
                className="flex cursor-not-allowed items-center justify-between rounded-md px-3 py-2 text-[var(--muted)] opacity-55"
                key={item}
              >
                <span>{item}</span>
                <span className="text-[11px]">futuro</span>
              </div>
            ))}
          </nav>
        </section>
      </div>

      <div className="mt-auto border-t border-[var(--border)] px-4 py-4">
        <div className="flex items-center justify-between text-xs text-[var(--muted)]">
          <span>Sprint 1</span>
          <span className="font-semibold text-[var(--gold-soft)]">Perfil</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-[var(--surface-soft)]">
          <div className="h-1.5 w-2/3 rounded-full bg-[var(--gold)]" />
        </div>
      </div>
    </aside>
  );
}
