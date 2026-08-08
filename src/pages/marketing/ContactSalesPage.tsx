import { Card, CardDescription } from '@/components/ui/card';

export default function ContactSalesPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-zinc-50 dark:bg-[#08080a] text-zinc-900 dark:text-white font-sans">
      <Card className="glass-panel border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0f]/95 shadow-2xl p-8 max-w-md w-full text-center space-y-4">
        <h3 className="text-lg font-black text-zinc-900 dark:text-white font-display">ContactSales Workspace</h3>
        <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
          This portal module is scaffolded and undergoing compliance verification.
        </CardDescription>
      </Card>
    </div>
  );
}
