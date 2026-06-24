import { redirect } from 'next/navigation';

// Root page redirects to dashboard (or login if not authenticated)
export default function Home() {
  redirect('/login');
}
