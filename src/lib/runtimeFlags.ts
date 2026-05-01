const rawMockFlag = ((import.meta as any).env.VITE_ENABLE_MOCK ?? "true")
  .toString()
  .trim()
  .toLowerCase();

export const isMockEnabled =
  rawMockFlag === "true" || rawMockFlag === "1" || rawMockFlag === "yes";
