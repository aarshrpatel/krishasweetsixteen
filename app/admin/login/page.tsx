import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <LoginForm />
    </main>
  );
}
