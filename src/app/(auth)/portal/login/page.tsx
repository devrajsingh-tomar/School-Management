import { LoginForm } from "@/components/auth/login-form";

export default function PortalLoginPage() {
    return (
        <LoginForm
            title="Student & Parent Portal"
            description="Access your academic records, attendance, and fee details."
            redirectTo="/portal"
            type="PORTAL"
        />
    );
}
