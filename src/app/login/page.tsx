'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/catalog'); // Redirige a /catalog
    } catch (err: any) {
      setError('Correo o contraseña inválidos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="w-full max-w-md bg-background/60 border border-neutral-800 rounded-2xl shadow-xl p-8 backdrop-blur-sm">
        <h2 className="text-3xl font-light uppercase tracking-[0.25em] text-center mb-8">
          Iniciar Sesión
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-transparent border border-neutral-700 text-sm text-foreground px-4 py-3 rounded-md focus:border-accent focus:outline-none transition"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-transparent border border-neutral-700 text-sm text-foreground px-4 py-3 rounded-md focus:border-accent focus:outline-none transition"
          />

          {error && (
            <p className="text-sm font-medium text-red-400 bg-red-950/40 border border-red-700 p-3 rounded-md text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-sm uppercase tracking-widest rounded-md transition ${
              loading
                ? "bg-neutral-700 cursor-not-allowed text-neutral-400"
                : "bg-accent text-white hover:opacity-80"
            }`}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-400 mt-6 tracking-wider">
          ¿No tienes cuenta?{" "}
          <a
            href="/register"
            className="text-accent hover:opacity-80 transition"
          >
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
}

// Estilos en línea básicos para que no se vea feo
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '400px',
    margin: '100px auto',
    padding: '2rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  title: {
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginTop: '-0.5rem',
    fontSize: '0.9rem',
  },
};
