export function formatIdentity(email: string | null | undefined): string {
    if (!email) return 'ANON';
    // Return first 4 characters, uppercase for a "code" look
    return email.substring(0, 4).toUpperCase();
}
