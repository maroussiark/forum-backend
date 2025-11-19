import prisma from "../config/database.js";

export async function generateId(model, prefix) {
  const last = await prisma[model].findMany({
    orderBy: { id: "desc" },
    take: 1,
  });

  if (!last.length) return `${prefix}00001`;

  const lastId = last[0].id.replace(prefix, "");
  const next = String(Number(lastId) + 1).padStart(5, "0");

  return `${prefix}${next}`;
}
