import { Prisma } from "@prisma/client";

// Extiende el tipo de categoría para incluir la imagen y descripción
export type CategoryWithImage = Prisma.SqlCategoryGetPayload<{}> & {
  imageUrl?: string;
  description?: string;
};