import { z } from "zod";

const figureDiagramSchema = z.object({
  type: z.enum(["triangle", "invertedTriangle", "circle", "square"]),
  figures: z.tuple([
    z.object({ values: z.array(z.number()) }),
    z.object({ values: z.array(z.union([z.number(), z.null()])) }),
  ]),
});

export const questionSchema = z.object({
  q: z.string(),
  opts: z.array(z.string()).length(4),
  ans: z.number().int().min(0).max(3),
  hint: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  cat: z.enum(["math", "symbols", "words", "patterns", "inequalities", "reading", "sentences", "oddOneOut", "shapes", "numberFigures"]).optional(),
  passage: z.string().optional(),
  diagram: figureDiagramSchema.optional(),
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
