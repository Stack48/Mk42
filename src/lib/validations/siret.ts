import { z } from 'zod';

export const siretSchema = z
  .string()
  .length(14, 'Le SIRET doit contenir 14 chiffres')
  .regex(/^\d{14}$/, 'Le SIRET ne doit contenir que des chiffres');
