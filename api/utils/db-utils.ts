
const RETRIABLE_CODES = new Set(["P1001", "P1017"]);
const RETRIABLE_MSGS = ["Can't reach database", "Connection pool timeout"];

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function withRetry<T>(
    fn: () => Promise<T>,
    retries = 3,
    baseDelayMs = 500
): Promise<T> {
    let lastErr: unknown;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err: any) {
            lastErr = err;

            const isRetriable =
                RETRIABLE_CODES.has(err.code) ||
                RETRIABLE_MSGS.some((m) => err.message?.includes(m));

            if (!isRetriable || attempt === retries) throw err;

            const delay = baseDelayMs * attempt;
            console.warn(
                `[db] connection error on attempt ${attempt}/${retries}, retrying in ${delay}ms…`
            );
            await sleep(delay);
        }
    }

    throw lastErr;
}
