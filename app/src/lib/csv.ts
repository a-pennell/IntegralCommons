/**
 * Minimal RFC 4180-compatible CSV parser.
 *
 * Supports:
 *   - Quoted fields (double-quotes; embedded quotes escaped as "")
 *   - CRLF and LF line endings
 *   - Blank lines are skipped
 *
 * Returns an array of row-objects keyed by the header row. Columns not in
 * the header are silently dropped; header columns with no data get ''.
 */
export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const rows: string[][] = lines.map(splitCsvRow).filter((r) => r.some((c) => c !== ''));

  if (rows.length < 2) return [];

  const headers = rows[0]!.map((h) => h.trim().toLowerCase());
  return rows.slice(1).map((cols) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = (cols[i] ?? '').trim();
    });
    return obj;
  });
}

function splitCsvRow(line: string): string[] {
  const fields: string[] = [];
  let i = 0;
  while (i <= line.length) {
    if (i === line.length) {
      fields.push('');
      break;
    }
    if (line[i] === '"') {
      // Quoted field.
      let field = '';
      i++; // skip opening quote
      while (i < line.length) {
        if (line[i] === '"') {
          if (line[i + 1] === '"') {
            field += '"';
            i += 2;
          } else {
            i++; // skip closing quote
            break;
          }
        } else {
          field += line[i];
          i++;
        }
      }
      fields.push(field);
      // skip comma
      if (line[i] === ',') i++;
    } else {
      // Unquoted field.
      const end = line.indexOf(',', i);
      if (end === -1) {
        fields.push(line.slice(i));
        break;
      }
      fields.push(line.slice(i, end));
      i = end + 1;
    }
  }
  return fields;
}
