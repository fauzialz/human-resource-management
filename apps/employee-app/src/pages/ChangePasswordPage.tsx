import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../api/client';
import { getUser } from '../lib/session';
import { useToast } from '@human-resource-management/ui-components';
import { PasswordInput } from '@human-resource-management/ui-components';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const sessionUser = getUser();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch(`/employees/${sessionUser!.id}/password`, {
        password: newPassword,
      });
      return res;
    },
    onSuccess: (res) => {
      if (res.error) {
        addToast(res.message, 'error');
        return;
      }
      addToast('Password changed successfully', 'success');
      navigate('/profile');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError('');

    if (!currentPassword) {
      setValidationError('Current password is required');
      return;
    }
    if (newPassword.length < 8) {
      setValidationError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError('New passwords do not match');
      return;
    }

    mutation.mutate();
  }

  return (
    <div className="p-4 sm:p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/profile')}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Back"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900">Change Password</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5"
      >
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="current-password"
          >
            Current Password
          </label>
          <PasswordInput
            id="current-password"
            required
            value={currentPassword}
            onChange={setCurrentPassword}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="new-password"
          >
            New Password
          </label>
          <PasswordInput
            id="new-password"
            required
            value={newPassword}
            onChange={setNewPassword}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="confirm-password"
          >
            Confirm New Password
          </label>
          <PasswordInput
            id="confirm-password"
            required
            value={confirmPassword}
            onChange={setConfirmPassword}
            hasError={!!validationError && newPassword !== confirmPassword}
          />
        </div>

        {(validationError || mutation.isError) && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {validationError || 'Something went wrong. Please try again.'}
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
        >
          {mutation.isPending ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
