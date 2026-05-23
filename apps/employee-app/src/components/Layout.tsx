import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ProfileAvatar } from '@human-resource-management/ui-components';
import { clearSession, getUser } from '../lib/session';
import { getPhotoUrl } from '../api/client';

type NavItem = { to: string; label: string; icon: React.ReactNode };

function CalendarIcon() {
  return (
    <svg
      className="w-5 h-5"
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
  );
}

function ChartIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      className="w-5 h-5"
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
  );
}

const NAV_ITEMS: NavItem[] = [
  { to: '/attendance', label: 'Attendance', icon: <CalendarIcon /> },
  { to: '/summary', label: 'Summary', icon: <ChartIcon /> },
];

const MOBILE_NAV_ITEMS: NavItem[] = [
  ...NAV_ITEMS,
  { to: '/profile', label: 'Profile', icon: <UserIcon /> },
];

export default function Layout() {
  const navigate = useNavigate();

  const user = getUser();

  function handleLogout() {
    navigate('/logout');
  }

  const sideNavClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-700 text-white'
        : 'text-blue-100 hover:bg-blue-700 hover:text-white'
    }`;

  const profileNavClass = (options: { isActive: boolean }) =>
    `${sideNavClass(options)} py-3 border border-blue-700`;

  const bottomNavClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-0.5 pt-1.5 pb-1 px-3 text-xs font-medium transition-colors ${
      isActive ? 'text-blue-600' : 'text-gray-500'
    }`;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar — desktop only */}
      <aside className="hidden lg:flex w-56 bg-blue-800 flex-col shrink-0">
        <div className="px-4 py-5 border-b border-blue-700">
          <span className="text-white font-bold text-lg">Employee App</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={sideNavClass}>
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="pb-4  space-y-1">
          <NavLink to="/profile" className={profileNavClass}>
            <ProfileAvatar
              src={getPhotoUrl(user?.photoUrl)}
              alt={user?.name ?? ''}
              name={user?.name ?? ''}
              size={50}
              borderSize={2}
            />
            <div>
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-blue-300">{user?.position}</div>
            </div>
          </NavLink>
          <div className="pt-3 px-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white transition-colors"
            >
              <LogoutIcon />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content — adds bottom padding on mobile for the nav bar */}
      <main className="flex-1 overflow-auto pb-16 lg:pb-0">
        <Outlet />
      </main>

      {/* Bottom nav — mobile only */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-stretch z-30">
        {MOBILE_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={bottomNavClass}
            style={{ flex: 1 }}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          style={{ flex: 1 }}
          className="flex flex-col items-center gap-0.5 pt-1.5 pb-1 px-3 text-xs font-medium text-gray-500 hover:text-red-500 transition-colors"
        >
          <LogoutIcon />
          Logout
        </button>
      </nav>
    </div>
  );
}
