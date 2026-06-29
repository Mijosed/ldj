import AppShell from '@/components/AppShell';
import { loadState } from '@/lib/prismaUtils';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const state = await loadState();
  return <AppShell initialState={state} />;
}
