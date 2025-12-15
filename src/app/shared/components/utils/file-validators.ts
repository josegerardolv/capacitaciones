// Utilidades para validación de archivos

export function isValidFileType(file: File, allowedTypes: string): boolean {
    if (!allowedTypes || allowedTypes === '*') return true;

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = allowedTypes.split(',').map(type => type.trim().toLowerCase());

    return allowedExtensions.includes(fileExtension) || allowedExtensions.includes('*');
}

export function isFileSizeOk(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function validateFile(file: File, allowedTypes: string, maxSizeMB: number): string | null {
    if (!isValidFileType(file, allowedTypes)) {
        return `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes}`;
    }

    if (!isFileSizeOk(file, maxSizeMB)) {
        return `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`;
    }

    return null;
}