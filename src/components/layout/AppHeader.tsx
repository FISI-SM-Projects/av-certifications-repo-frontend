export function AppHeader() {
  return (
    <header className="flex min-h-16 flex-col gap-3 border-b border-[var(--border)] bg-[rgba(20,29,24,0.92)] px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs text-[var(--muted)]">Sprint 1 &gt; Perfil Docente</p>
        <div className="mt-1 flex flex-wrap items-end gap-3">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--text)]">
            Perfil Docente
          </h2>
          <span className="pb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-soft)]">
            Sistema de Gestión Docente FISI
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-[var(--gold)] bg-[rgba(201,168,93,0.12)] px-3 py-1 text-xs font-semibold text-[var(--gold-soft)]">
          Demo
        </span>
        <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--muted)]">
          Sin autenticación
        </span>
        <button
          className="grid h-8 w-8 place-items-center rounded-md border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--gold-soft)]"
          type="button"
          title="Tema institucional"
        >
          ●
        </button>
      </div>
    </header>
  );
}
