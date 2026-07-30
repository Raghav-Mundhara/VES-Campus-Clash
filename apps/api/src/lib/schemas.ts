import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  institute: z.string().min(2, "Institute must be at least 2 characters").max(100, "Institute is too long"),
  course: z.string().min(2, "Course must be at least 2 characters").max(100, "Course is too long"),
  year: z.string().min(1, "Year is required").max(20, "Year is too long"),
  igHandle: z.string().min(2, "Instagram handle must be at least 2 characters").max(50, "Instagram handle is too long"),
});

export type RegisterData = z.infer<typeof registerSchema>;
