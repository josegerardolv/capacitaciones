export interface Course {
    id: number;
    name: string; // Para "A05", "A06"
    description: string;
    duration: number; // "3 horas"
    createdAt?: string;
    courseTypeId?: number; // Relación con CourseTypeConfig
    courseTypeName?: string; // Para mostrar en tabla
}
