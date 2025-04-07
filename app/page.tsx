import { redirect } from 'next/navigation';

export default function Home() {
  // Add a return statement to ensure the function completes
  return redirect('/dashboard');
}
