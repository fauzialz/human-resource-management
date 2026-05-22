export interface ChangeFieldEvent {
  fieldName: string;
  oldValue: string;
  newValue: string;
}

export interface ProfileChangeEvent {
  employeeId: string;
  employeeName: string;
  changes: ChangeFieldEvent[];
  changedAt: Date;
  changedById: string;
}
