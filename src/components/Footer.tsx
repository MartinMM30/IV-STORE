export default function Footer() {
  return (
    <footer className="bg-background border-t border-neutral-800 mt-20">
  <div className="container mx-auto px-6 py-8 text-center text-neutral-500 text-xs tracking-widest uppercase">
    © {new Date().getFullYear()} IV — Todos los derechos reservados.
  </div>
</footer>

  );
}
