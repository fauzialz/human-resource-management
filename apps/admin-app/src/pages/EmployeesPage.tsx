import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, unwrap } from '../api/client';
import { ApiError } from '../types/api';
import { getUser } from '../lib/session';
import { Employee, UserRole } from '@human-resource-management/shared-types';

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

export default function EmployeesPage() {
  const user = getUser();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeFormData>(defaultForm);
  const [formError, setFormError] = useState('');

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => api.get<Employee[]>('/employees').then(unwrap),
  });

  const createMutation = useMutation({
    mutationFn: (data: EmployeeFormData) =>
      api
        .post('/employees', { ...data, createdById: user?.id ?? '' })
        .then(unwrap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      closeModal();
    },
    onError: (err: ApiError) => setFormError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<EmployeeFormData>) =>
      api
        .patch(`/employees/${editTarget!.id}`, {
          ...data,
          updatedById: user?.id ?? '',
        })
        .then(unwrap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      closeModal();
    },
    onError: (err: ApiError) => setFormError(err.message),
  });

  function openCreate() {
    setEditTarget(null);
    setForm(defaultForm);
    setFormError('');
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
    setFormError('');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditTarget(null);
    setForm(defaultForm);
    setFormError('');
  }

  function handleField(field: keyof EmployeeFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError('');
    if (editTarget) {
      const patch: Partial<EmployeeFormData> = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        position: form.position,
        role: form.role,
      };
      if (form.password) patch.password = form.password;
      updateMutation.mutate(patch);
    } else {
      createMutation.mutate(form);
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
              <Field label="Name">
                <input
                  required
                  value={form.name}
                  onChange={(e) => handleField('name', e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => handleField('email', e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field
                label={
                  editTarget ? 'Password (leave blank to keep)' : 'Password'
                }
              >
                <input
                  type="password"
                  required={!editTarget}
                  value={form.password}
                  onChange={(e) => handleField('password', e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Phone">
                <input
                  value={form.phone}
                  onChange={(e) => handleField('phone', e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Position">
                <input
                  required
                  value={form.position}
                  onChange={(e) => handleField('position', e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Role">
                <select
                  value={form.role}
                  onChange={(e) => handleField('role', e.target.value)}
                  className={inputCls}
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
                  disabled={isSaving}
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

const inputCls =
  'w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
