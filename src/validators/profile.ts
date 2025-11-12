import { z } from 'zod';

export const profileUpdateSchema = z.object({
  fotoUrl: z.string().url().optional().or(z.literal('')),
  descripcion: z.string().max(300, 'La descripción no puede tener más de 300 caracteres').optional(),
  intereses: z.array(
    z.string()
      .min(1, 'El interés debe tener al menos 1 carácter')
      .max(30, 'El interés no puede tener más de 30 caracteres')
  ).max(5, 'No puedes tener más de 5 intereses').optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// Función helper para validar intereses sin duplicados (case-insensitive)
export const validateUniqueInterests = (intereses: string[]): { isValid: boolean; error?: string } => {
  const normalized = intereses.map(i => i.toLowerCase().trim());
  const unique = new Set(normalized);
  
  if (normalized.length !== unique.size) {
    return { isValid: false, error: 'No puedes tener intereses duplicados' };
  }
  
  if (intereses.length > 5) {
    return { isValid: false, error: 'No puedes tener más de 5 intereses' };
  }
  
  return { isValid: true };
};

