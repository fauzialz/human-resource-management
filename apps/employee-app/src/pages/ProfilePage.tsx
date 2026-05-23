import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api, unwrap, getPhotoUrl } from '../api/client';
import { getUser } from '../lib/session';
import type { Employee } from '@human-resource-management/shared-types';
import { ProfileAvatar } from '@human-resource-management/ui-components';

export default function ProfilePage() {
  const navigate = useNavigate();
  const sessionUser = getUser();

  const {
    data: employee,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['profile', sessionUser?.id],
    queryFn: async () => {
      const res = await api.get<Employee>(`/employees/${sessionUser!.id}`);
      return unwrap(res);
    },
    enabled: !!sessionUser?.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-gray-400">Loading profile…</p>
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-red-500">Failed to load profile.</p>
      </div>
    );
  }

  const photoUrl = getPhotoUrl(employee.photoUrl);

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Profile</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header with photo */}
        <div className="bg-blue-600 px-6 pt-8 pb-14 flex justify-center">
          <ProfileAvatar
            src={photoUrl}
            alt={employee.name}
            name={employee.name}
          />
        </div>

        {/* Info */}
        <div className="-mt-8 px-6 pb-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
            <h2 className="text-lg font-bold text-gray-900 text-center mb-1">
              {employee.name}
            </h2>
            <p className="text-sm text-blue-600 text-center font-medium">
              {employee.position}
            </p>
          </div>

          <div className="space-y-3">
            <ProfileField label="Email" value={employee.email} />
            <ProfileField label="Phone" value={employee.phone || '—'} />
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          <button
            onClick={() => navigate('/profile/edit')}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            Edit Profile
          </button>
          <button
            onClick={() => navigate('/change-password')}
            className="w-full py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
}
