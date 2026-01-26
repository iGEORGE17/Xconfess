import Header from '../components/layout/Header';
import { ProfileHeader } from './profile/ProfileHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
    </>
  );
}
