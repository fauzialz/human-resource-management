import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, unwrap, getPhotoUrl } from '../api/client';
import {
  ApiError,
  Employee,
  UserRole,
} from '@human-resource-management/shared-types';
import {
  Input,
  InputPassword,
  InputPhoto,
} from '@human-resource-management/ui-components';

interface EmployeeFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  position: string;
  role: UserRole;
}

const defaultForm: EmployeeFormData = {
  name: '',
  email: '',
  password: '',
  phone: '',
  position: '',
  role: UserRole.EMPLOYEE,
};

const extractFieldErrors = (err: ApiError): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const [field, msgs] of Object.entries(err.errors?.fieldErrors ?? {})) {
    result[field] = msgs[0] ?? '';
  }
  return result;
};

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeFormData>(defaultForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => api.get<Employee[]>('/employees').then(unwrap),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => api.post('/employees', data).then(unwrap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      closeModal();
    },
    onError: (err: ApiError) => {
      setFormError(err.message);
      setFieldErrors(extractFieldErrors(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) =>
      api.patch(`/employees/${editTarget!.id}`, data).then(unwrap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      closeModal();
    },
    onError: (err: ApiError) => {
      setFormError(err.message);
      setFieldErrors(extractFieldErrors(err));
    },
  });

  function openCreate() {
    setEditTarget(null);
    setForm(defaultForm);
    setPhoto(null);
    setPhotoRemoved(false);
    setConfirmPassword('');
    setFormError('');
    setFieldErrors({});
    setModalOpen(true);
  }

  function openEdit(emp: Employee) {
    setEditTarget(emp);
    setForm({
      name: emp.name,
      email: emp.email,
      password: '',
      phone: emp.phone ?? '',
      position: emp.position,
      role: emp.role,
    });
    setPhoto(null);
    setPhotoRemoved(false);
    setConfirmPassword('');
    setFormError('');
    setFieldErrors({});
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditTarget(null);
    setForm(defaultForm);
    setPhoto(null);
    setPhotoRemoved(false);
    setConfirmPassword('');
    setFormError('');
    setFieldErrors({});
  }

  function handleField(field: keyof EmployeeFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handlePasswordChange(value: string) {
    handleField('password', value);
    if (confirmPassword) {
      const mismatch = value !== confirmPassword;
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: mismatch ? 'Passwords do not match' : '',
      }));
    }
  }

  function handleConfirmPasswordChange(value: string) {
    setConfirmPassword(value);
    const error =
      value && value !== form.password ? 'Passwords do not match' : '';
    setFieldErrors((prev) => ({ ...prev, confirmPassword: error }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError('');
    setFieldErrors({});

    if (form.password) {
      if (!confirmPassword) {
        setFieldErrors({ confirmPassword: 'Please confirm your password' });
        return;
      }
      if (form.password !== confirmPassword) {
        setFieldErrors({ confirmPassword: 'Passwords do not match' });
        return;
      }
    }

    const fd = new FormData();
    if (editTarget) {
      fd.append('name', form.name);
      fd.append('email', form.email);
      if (form.phone) fd.append('phone', form.phone);
      fd.append('position', form.position);
      fd.append('role', form.role);
      if (form.password) fd.append('password', form.password);
      if (photo) fd.append('photo', photo);
      if (photoRemoved && !photo) fd.append('removePhoto', 'true');
      updateMutation.mutate(fd);
    } else {
      fd.append('name', form.name);
      fd.append('email', form.email);
      fd.append('password', form.password);
      if (form.phone) fd.append('phone', form.phone);
      fd.append('position', form.position);
      fd.append('role', form.role);
      if (photo) fd.append('photo', photo);
      createMutation.mutate(fd);
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Employees</h1>
        <button
          onClick={openCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          + Add Employee
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Email', 'Position', 'Role', 'Phone', ''].map((h) => (
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
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {emp.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {emp.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {emp.position}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        emp.role === UserRole.ADMIN
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {emp.phone ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(emp)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-gray-400"
                  >
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editTarget ? 'Edit Employee' : 'Add Employee'}
            </h2>
            {formError && (
              <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {formError}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex justify-center mb-1">
                <InputPhoto
                  value={photo}
                  onChange={(f) => {
                    setPhoto(f);
                    if (f) setPhotoRemoved(false);
                  }}
                  currentUrl={
                    photoRemoved ? undefined : getPhotoUrl(editTarget?.photoUrl)
                  }
                  onRemove={() => setPhotoRemoved(true)}
                />
              </div>
              <Field label="Name">
                <Input
                  required
                  value={form.name}
                  onChange={(e) => handleField('name', e.target.value)}
                  error={fieldErrors['name']}
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => handleField('email', e.target.value)}
                  error={fieldErrors['email']}
                />
              </Field>
              <Field
                label={
                  editTarget ? 'Password (leave blank to keep)' : 'Password'
                }
              >
                <InputPassword
                  required={!editTarget}
                  value={form.password}
                  onChange={handlePasswordChange}
                  error={fieldErrors['password']}
                />
              </Field>
              <Field
                label={
                  editTarget
                    ? 'Confirm Password (leave blank to keep)'
                    : 'Confirm Password'
                }
              >
                <InputPassword
                  required={!editTarget}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  error={fieldErrors['confirmPassword']}
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={form.phone}
                  onChange={(e) => handleField('phone', e.target.value)}
                  error={fieldErrors['phone']}
                />
              </Field>
              <Field label="Position">
                <Input
                  required
                  value={form.position}
                  onChange={(e) => handleField('position', e.target.value)}
                  error={fieldErrors['position']}
                />
              </Field>
              <Field label="Role" error={fieldErrors['role']}>
                <select
                  value={form.role}
                  onChange={(e) => handleField('role', e.target.value)}
                  className={inputCls(!!fieldErrors['role'])}
                >
                  <option value={UserRole.EMPLOYEE}>Employee</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                </select>
              </Field>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !!fieldErrors['confirmPassword']}
                  className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded"
                >
                  {isSaving ? 'Saving…' : editTarget ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = (hasError = false) =>
  `w-full border ${hasError ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`;

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
