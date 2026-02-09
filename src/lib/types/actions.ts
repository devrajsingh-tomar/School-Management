export type ActionState<T> = {
    success: boolean;
    data?: T | null;
    message?: string;
    errors?: Record<string, string[]>;
};
