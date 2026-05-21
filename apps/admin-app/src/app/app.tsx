import { Navigate, Route, Routes } from 'react-router-dom';
import { withAuthorizeAccess } from '../hooks/withAuthorizeAccess';
import { withPublicAccess } from '../hooks/withPublicAccess';
import _LoginPage from '../pages/LoginPage';
import _LogoutPage from '../pages/LogoutPage';
import _Layout from '../components/Layout';
import EmployeesPage from '../pages/EmployeesPage';
import AttendancePage from '../pages/AttendancePage';

const Layout = withAuthorizeAccess(_Layout);
const LoginPage = withPublicAccess(_LoginPage);
const LogoutPage = withAuthorizeAccess(_LogoutPage);

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route element={<Layout />}>
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/" element={<Navigate to="/employees" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/employees" replace />} />
    </Routes>
  );
}

export default App;
