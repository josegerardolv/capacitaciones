export interface Course {
    id: number;
    code: string; // Para "A05", "A06"
    description: string;
    duration: number; // "3 horas"
    created_at?: string;
}
