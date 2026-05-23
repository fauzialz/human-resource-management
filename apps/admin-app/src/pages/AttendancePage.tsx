import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, unwrap } from '../api/client';
import { AttendanceAllResponse } from '@human-resource-management/shared-types';
import { Input } from '@human-resource-management/ui-components';

function startOfMonth(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(d: Date | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AttendancePage() {
  const [from, setFrom] = useState(startOfMonth);
  const [to, setTo] = useState(today);

  const {
    data: records = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['attendance-all', from, to],
    refetchOnMount: true,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.set('from', new Date(from).toISOString());
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        params.set('to', end.toISOString());
      }
      const res = await api.get<AttendanceAllResponse[]>(
        `/attendance/all?${params}`,
      );
      return unwrap(res);
    },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Attendance</h1>
      </div>

      {/* Date range picker */}
      <div className="flex items-center gap-4 mb-6 bg-white rounded-lg shadow px-4 py-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">From</label>
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">To</label>
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <span className="text-xs text-gray-400  ml-auto">
          {records.length} record{records.length !== 1 ? 's' : ''}
        </span>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : isError ? (
        <p className="text-sm text-red-500">Failed to load attendance data.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Date', 'Clock In', 'Clock Out'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {r.employee.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {formatDate(r.clockIn)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatTime(r.clockIn)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatTime(r.clockOut)}
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-gray-400"
                  >
                    No records for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
