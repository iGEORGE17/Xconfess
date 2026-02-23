import Header from "@/app/components/layout/Header";
import { AuthGuard } from "@/app/components/AuthGuard";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AuthGuard>
			<div className='min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100'>
				<Header />
				<main className='mx-auto max-w-3xl px-4 py-8 sm:px-6'>
					{children}
				</main>
			</div>
		</AuthGuard>
	);
}
