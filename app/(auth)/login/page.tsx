import { Suspense } from 'react';
import { LoginForm } from './LoginForm';

export const metadata = { title: 'เข้าสู่ระบบ · ระบบจัดการงานนักการภารโรง' };

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
