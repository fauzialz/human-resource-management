import { Navigate, Route, Routes } from 'react-router-dom';
import { withAuthorizeAccess } from '../hooks/withAuthorizeAccess';
import { withPublicAccess } from '../hooks/withPublicAccess';
import _LoginPage from '../pages/LoginPage';
import _LogoutPage from '../pages/LogoutPage';
import _Layout from '../components/Layout';
import AttendancePage from '../pages/AttendancePage';
import SummaryPage from '../pages/SummaryPage';
import ProfilePage from '../pages/ProfilePage';
import ProfileEditPage from '../pages/ProfileEditPage';
import ChangePasswordPage from '../pages/ChangePasswordPage';

const Layout = withAuthorizeAccess(_Layout);
const LoginPage = withPublicAccess(_LoginPage);
const LogoutPage = withAuthorizeAccess(_LogoutPage);

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route element={<Layout />}>
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<ProfileEditPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/" element={<Navigate to="/attendance" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/attendance" replace />} />
    </Routes>
  );
}

export default App;
