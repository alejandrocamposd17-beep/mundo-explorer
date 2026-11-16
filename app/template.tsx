/** template.tsx se vuelve a montar en cada navegación: lo usamos para una transición suave entre páginas. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
