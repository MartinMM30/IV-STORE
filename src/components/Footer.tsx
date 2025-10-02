export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t mt-10">
      <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} IV. Todos los derechos reservados.
      </div>
    </footer>
  );
}
