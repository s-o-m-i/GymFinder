import { z } from "zod";

export const GYM_LEAD_CUSTOM_GOAL_MAX = 100;

export const gymLeadGoalSchema = z.enum([
  "WEIGHT_LOSS",
  "MUSCLE_GAIN",
  "MMA",
  "BOXING",
  "OTHER",
]);

export const createGymLeadSchema = z
  .object({
    gymId: z.string().min(1),
    name: z
      .string()
      .trim()
      .min(2, "Please enter your name")
      .max(80, "Name is too long"),
    goal: gymLeadGoalSchema,
    customGoal: z.string().trim().max(GYM_LEAD_CUSTOM_GOAL_MAX).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.goal === "OTHER") {
      if (!data.customGoal || data.customGoal.length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["customGoal"],
          message: "Please describe your goal",
        });
      }
    }
  });

export type CreateGymLeadInput = z.infer<typeof createGymLeadSchema>;
