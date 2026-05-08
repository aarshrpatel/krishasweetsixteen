import * as XLSX from "xlsx";

export type ParsedFamily = {
  name: string;
  maxAttendees: number;
  email?: string;
  phone?: string;
};

function pick(row: Record<string, unknown>, keys: string[]): unknown {
  const lc = Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k.toLowerCase().trim(), v]),
  );
  for (const k of keys) {
    const v = lc[k.toLowerCase()];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return undefined;
}

export function parseFamilies(buffer: ArrayBuffer): ParsedFamily[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) throw new Error("Workbook contains no sheets");
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
    defval: "",
  });

  return rows.map((row, i) => {
    const lineNo = i + 2; // header is row 1
    const nameRaw = pick(row, [
      "Family Name",
      "Family",
      "Name",
      "family_name",
      "Last Name",
    ]);
    const peopleRaw = pick(row, [
      "People",
      "Attendees",
      "Number of People",
      "Count",
      "Guests",
      "Size",
      "people",
    ]);
    const emailRaw = pick(row, ["Email", "email", "E-mail"]);
    const phoneRaw = pick(row, ["Phone", "phone", "Mobile", "Cell"]);

    const name = String(nameRaw ?? "").trim();
    const maxAttendees = Number(peopleRaw);

    if (!name) throw new Error(`Row ${lineNo}: missing family name`);
    if (!Number.isFinite(maxAttendees) || maxAttendees < 1) {
      throw new Error(
        `Row ${lineNo} (${name}): missing or invalid number of people`,
      );
    }

    return {
      name,
      maxAttendees: Math.floor(maxAttendees),
      email: emailRaw ? String(emailRaw).trim() : undefined,
      phone: phoneRaw ? String(phoneRaw).trim() : undefined,
    };
  });
}
