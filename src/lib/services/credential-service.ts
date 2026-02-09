"use server";

/**
 * Service to handle credential distribution via various channels.
 * In a real-world scenario, this would integrate with Twilio, AWS SES, or WhatsApp Business API.
 */
export async function sendCredentials(payload: {
    name: string;
    identifier: string;
    password: string;
    role: string;
    schoolName?: string;
    phone?: string;
    email?: string;
    channel: "SMS" | "EMAIL" | "WHATSAPP";
}) {
    // Simulated delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const message = `
        Hello ${payload.name},
        Your account at ${payload.schoolName || "EduFlow SaaS"} has been created.
        Role: ${payload.role}
        Login URL: ${payload.role === "STUDENT" || payload.role === "PARENT" ? "/portal/login" : "/school/login"}
        Username: ${payload.identifier}
        Password: ${payload.password}
        Please change your password after your first login.
    `;

    // In production, you would call your API provider here.
    console.log(`[CREDENTIAL_SERVICE] Sending via ${payload.channel} to ${payload.email || payload.phone}:`, message);

    return {
        success: true,
        message: `Credentials sent successfully via ${payload.channel}`
    };
}
