import { LoginForm } from "@/components/auth/login-form";

export default function SchoolLoginPage() {
    return (
        <LoginForm
            title="School Staff Login"
            description="Enter your staff credentials to manage school operations."
            redirectTo="/school"
            type="SCHOOL"
        />
    );
}
