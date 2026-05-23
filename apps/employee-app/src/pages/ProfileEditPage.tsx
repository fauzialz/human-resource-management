import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, axiosInstance, unwrap, getPhotoUrl } from '../api/client';
import { getUser, updateUser } from '../lib/session';
import {
  useToast,
  PhotoInput,
  Input,
} from '@human-resource-management/ui-components';
import type { Employee } from '@human-resource-management/shared-types';
import type { ApiResponse } from '@human-resource-management/shared-types';

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const sessionUser = getUser();

  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [field: string]: string }>(
    {},
  );

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

  useEffect(() => {
    if (employee) setPhone(employee.phone ?? '');
  }, [employee]);

  const mutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('phone', phone);
      if (photo) formData.append('photo', photo);
      if (removePhoto) formData.append('removePhoto', 'true');

      const res = await axiosInstance.patch<ApiResponse<Employee>>(
        `/employees/${sessionUser!.id}`,
        formData,
      );
      return res.data;
    },
    onSuccess: (res) => {
      if (res.error) {
        addToast(res.message, 'error');
        setFieldErrors({
          phone: res.errors?.fieldErrors?.phone?.[0] ?? '',
        });
        return;
      }
      updateUser({ phone: res.data.phone, photoUrl: res.data.photoUrl });
      void queryClient.invalidateQueries({
        queryKey: ['profile', sessionUser?.id],
      });
      addToast('Profile updated', 'success');
      navigate('/profile');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-gray-400">Loading…</p>
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

  const currentPhotoUrl = removePhoto
    ? undefined
    : getPhotoUrl(employee.photoUrl);

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
        <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6"
      >
        <div className="flex flex-col items-center gap-3">
          <label className="text-sm font-medium text-gray-700 self-start">
            Photo
          </label>
          <PhotoInput
            value={photo}
            onChange={(f) => {
              setPhoto(f);
              if (!f) setRemovePhoto(false);
            }}
            currentUrl={currentPhotoUrl}
            onRemove={() => setRemovePhoto(true)}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="phone"
          >
            Phone
          </label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +628123456789"
            error={fieldErrors.phone}
          />
        </div>

        {mutation.isError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            Something went wrong. Please try again.
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
        >
          {mutation.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
