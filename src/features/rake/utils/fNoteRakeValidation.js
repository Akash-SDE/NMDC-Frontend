export function normalizeFNoteKey(fNote) {
  const value = String(fNote ?? "").trim();
  if (!value || value === "-") return "";
  return value.toLowerCase();
}

export function findRakeWithFNote(rows, fNote, { excludeRakeId = null } = {}) {
  const key = normalizeFNoteKey(fNote);
  if (!key) return null;

  return (
    (rows ?? []).find((row) => {
      if (
        excludeRakeId != null &&
        String(row.rakeId) === String(excludeRakeId)
      ) {
        return false;
      }
      return normalizeFNoteKey(row.fNote) === key;
    }) ?? null
  );
}

export function assertUniqueFNoteOnRake(rows, fNote, { excludeRakeId = null } = {}) {
  const duplicate = findRakeWithFNote(rows, fNote, { excludeRakeId });
  if (!duplicate) return;

  const label = duplicate.rakeNumber || duplicate.rakeId;
  throw new Error(
    `F-Note ${String(fNote).trim()} is already used by rake ${label}. Each F-Note can only be linked to one rake.`,
  );
}