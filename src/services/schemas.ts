import { z } from "zod";

export const questionSchema = z.object({
  q: z.string(),
  opts: z.array(z.string()).length(4),
  ans: z.number().int().min(0).max(3),
  hint: z.string(),
});

const sceneObjectSchema = z.object({
  type: z.enum([
    "tree",
    "rock",
    "crystal",
    "book",
    "tower",
    "orb",
    "mushroom",
    "pillar",
    "arch",
  ]),
  position: z.tuple([z.number(), z.number(), z.number()]),
  scale: z.number(),
  color: z.string(),
  emissive: z.string().nullable().optional().transform(v => v ?? undefined),
  animation: z.enum(["float", "rotate", "pulse", "sway"]).nullable().optional().transform(v => v ?? undefined),
});

export const generatedSceneSchema = z.object({
  objects: z.array(sceneObjectSchema),
  ambientColor: z.string(),
  fogColor: z.string(),
  groundColor: z.string(),
  description: z.string(),
});
