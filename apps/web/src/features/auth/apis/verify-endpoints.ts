/**
 * API Helper functions for verification endpoints.
 */

/**
 * Calls GET /api/auth/verify-email
 * @param token The email verification token
 * @returns Response data
 */
export async function verifyEmail(token: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const res = await fetch(`${apiUrl}/api/auth/verify-email?token=${token}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to verify email");
    return result.data;
}

/**
 * Calls POST /api/auth/verify-campus-id
 * Requires JWT token.
 * @param token The user's JWT token
 * @param qrPayload The extracted QR code payload
 * @returns Response data
 */
export async function verifyCampusId(token: string, qrPayload: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const res = await fetch(`${apiUrl}/api/auth/verify-campus-id`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ qrPayload }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to verify Campus ID");
    return result.data;
}
