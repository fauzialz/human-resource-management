export interface ProfileChangeEvent {
  employeeId: string;
  changedField: string;
  oldValue: string;
  newValue: string;
  changedAt: Date;
}
