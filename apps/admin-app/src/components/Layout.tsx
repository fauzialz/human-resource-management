import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { BASE_URL } from '../api/client';
import { getToken } from '../lib/session';

interface ProfileChangeEvent {
  employeeId: string;
  changes: { fieldName: string }[];
}

export default function Layout() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    const url = `${BASE_URL}/admin/events?token=${encodeURIComponent(token)}`; // BASE_URL already includes /api
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as ProfileChangeEvent;
        const fields = event.changes.map((c) => c.fieldName).join(', ');
        addToast(
          `Employee ${event.employeeId} changed: ${fields || 'profile'}`,
        );
      } catch {
        // ignore malformed
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [addToast]);

  function handleLogout() {
    navigate('/logout');
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-700 text-white'
        : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
    }`;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-indigo-800 flex flex-col shrink-0">
        <div className="px-4 py-5 border-b border-indigo-700">
          <span className="text-white font-bold text-lg">HR Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink to="/employees" className={navClass}>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Employees
          </NavLink>
          <NavLink to="/attendance" className={navClass}>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Attendance
          </NavLink>
        </nav>
        <div className="px-3 py-4 border-t border-indigo-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-indigo-100 hover:bg-indigo-700 hover:text-white transition-colors"
          >
            <svg
              className="w-4 h-4"
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
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
