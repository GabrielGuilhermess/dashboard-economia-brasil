import { DashboardShell } from '@/components/layout/dashboard-shell';
import {
  CardSkeleton,
  ChartSkeleton,
  MapSkeleton,
  TableSkeleton,
} from '@/components/ui/skeleton';

export default function DashboardLoadingPage() {
  return (
    <DashboardShell>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <CardSkeleton key={`dashboard-loading-card-${index}`} />
        ))}
      </div>

      <ChartSkeleton height={360} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartSkeleton height={240} />
        <ChartSkeleton height={240} />
      </div>

      <MapSkeleton />
      <TableSkeleton />
    </DashboardShell>
  );
}
