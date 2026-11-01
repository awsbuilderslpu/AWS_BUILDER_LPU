export function displayName(
  first: string | null | undefined,
  last: string | null | undefined
): string {
  const name = [first, last]
    .map((s) => s?.trim())
    .filter(Boolean)
    .join(" ");

  return name || "(no name)";
}

export function programmeLabel(
  programme: string | null | undefined,
  department: string | null | undefined,
  departments: { value: string; short: string }[]
): string {
  const prog = programme?.trim();
  const deptVal = department?.trim();

  if (!prog && !deptVal) {
    return "-";
  }

  const match = deptVal
    ? departments.find(
        (d) => d.value.toLowerCase() === deptVal.toLowerCase()
      )
    : undefined;

  const shortDept = match?.short?.trim();

  if (prog && shortDept) {
    return `${prog} (${shortDept})`;
  }
  if (prog) {
    return prog;
  }
  if (shortDept) {
    return `(${shortDept})`;
  }
  return "-";
}

