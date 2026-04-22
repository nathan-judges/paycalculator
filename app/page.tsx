/**
 * Home page — placeholder UI confirming store integration.
 *
 * This is a server component that renders the client-side StateSync
 * boundary and a minimal status display. Full UI is Week 3.
 */

import { StateSync } from './components/StateSync';
import { StoreStatus } from './components/StoreStatus';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <StateSync />
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Australian Salary Comparison Tool
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Compare take-home pay across scenarios and financial years.
          </p>
          <StoreStatus />
        </div>
      </main>
    </div>
  );
}
