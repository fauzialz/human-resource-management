import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, unwrap } from '../api/client';
import { useToast } from '@human-resource-management/ui-components';
import type { AttendanceRecord } from '@human-resource-management/shared-types';
import { getUser } from '../lib/session';

function formatTime(d: Date | null | string): string {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AttendancePage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const user = getUser();

  const { data: record, isLoading } = useQuery({
    queryKey: ['attendance-today', user?.id],
    queryFn: async () => {
      const res = await api.get<AttendanceRecord>('/attendance/today');
      return unwrap(res);
    },
    refetchOnWindowFocus: true,
  });

  const todayRecord = record ?? null;
  const hasClockedIn = todayRecord?.clockIn != null;
  const hasClockedOut = todayRecord?.clockOut != null;

  const clockInMutation = useMutation({
    mutationFn: () => api.post<AttendanceRecord>('/attendance/clock-in'),
    onSuccess: (res) => {
      if (res.error) {
        addToast(res.message, 'error');
        return;
      }
      addToast('Clocked in successfully', 'success');
      void queryClient.invalidateQueries({ queryKey: ['attendance-today'] });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: () => api.post<AttendanceRecord>('/attendance/clock-out'),
    onSuccess: (res) => {
      if (res.error) {
        addToast(res.message, 'error');
        return;
      }
      addToast('Clocked out successfully', 'success');
      void queryClient.invalidateQueries({ queryKey: ['attendance-today'] });
    },
  });

  const isActing = clockInMutation.isPending || clockOutMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start p-6 pt-12">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Attendance</h1>
        <p className="text-sm text-gray-500 mb-8">
          {new Date().toLocaleDateString([], {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>

        {/* Status card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          {isLoading ? (
            <p className="text-sm text-gray-400 text-center">
              Loading today's record…
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  Clock In
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {hasClockedIn ? formatTime(todayRecord.clockIn) : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  Clock Out
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {hasClockedOut ? formatTime(todayRecord.clockOut) : '—'}
                </span>
              </div>
              {hasClockedOut && (
                <p className="text-xs text-green-600 text-center pt-2 font-medium">
                  Attendance complete for today
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => clockInMutation.mutate()}
            disabled={isActing || hasClockedIn || isLoading}
            className="flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 font-medium text-sm transition-all
              enabled:bg-blue-600 enabled:border-blue-600 enabled:text-white enabled:hover:bg-blue-700 enabled:active:scale-95
              disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
            {clockInMutation.isPending ? 'Clocking In…' : 'Clock In'}
          </button>

          <button
            onClick={() => clockOutMutation.mutate()}
            disabled={isActing || !hasClockedIn || hasClockedOut || isLoading}
            className="flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 font-medium text-sm transition-all
              enabled:bg-orange-500 enabled:border-orange-500 enabled:text-white enabled:hover:bg-orange-600 enabled:active:scale-95
              disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {clockOutMutation.isPending ? 'Clocking Out…' : 'Clock Out'}
          </button>
        </div>
      </div>
    </div>
  );
}
