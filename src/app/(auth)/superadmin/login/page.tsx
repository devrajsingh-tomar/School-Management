import { LoginForm } from "@/components/auth/login-form";

export default function SuperAdminLoginPage() {
    return (
        <LoginForm
            title="SaaS Administrator"
            description="Secure access for platform management and system configuration."
            redirectTo="/superadmin"
            type="SUPERADMIN"
        />
    );
}
