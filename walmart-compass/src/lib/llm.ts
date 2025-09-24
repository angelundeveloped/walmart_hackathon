export async function askGemini(message: string): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    throw new Error('LLM request failed');
  }
  const data = await res.json();
  return data.text as string;
}

// Parse YAML list returned by the model into string[]
export function parseItemsFromYaml(yamlText: string): string[] {
  // light-weight YAML parse for expected structure: items: - name: ...
  // We'll avoid adding a new dependency; do minimal parsing.
  try {
    const lines = yamlText.split('\n').map(l => l.trim());
    const items: string[] = [];
    let inItems = false;
    for (const line of lines) {
      if (line.startsWith('items:')) { inItems = true; continue; }
      if (inItems) {
        const m = line.match(/-\s*name:\s*(.+)/i);
        if (m) {
          items.push(m[1].trim());
        } else if (line && !line.startsWith('-')) {
          // stop at next section
          break;
        }
      }
    }
    return items;
  } catch {
    return [];
  }
}

// Map item names to coordinates by scanning the YAML layout loaded in the app's public folder.
export async function mapItemsToCoordinates(names: string[]): Promise<{ id: string; name: string; x: number; y: number }[]> {
  try {
    const res = await fetch('/data/store-layout.yaml');
    const text = await res.text();
    // lightweight parse: look for lines like: "- id:" and following "name:" and "coordinates: [x, y]"
    const lines = text.split('\n');
    const entries: { id: string; name: string; x: number; y: number }[] = [];
    type WorkingEntry = { id: string; name?: string; coords?: [number, number] } | null;
    let current: WorkingEntry = null;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('- id:')) {
        if (current && current.name && current.coords) {
          entries.push({ id: current.id, name: current.name, x: current.coords[0], y: current.coords[1] });
        }
        current = { id: line.replace('- id:', '').trim() };
      } else if (current && line.startsWith('name:')) {
        current.name = line.replace('name:', '').trim().replace(/^\"|\"$/g, '');
      } else if (current && line.startsWith('coordinates:')) {
        const m = line.match(/\[(\s*[-\d.]+)\s*,\s*([-\d.]+)\]/);
        if (m) current.coords = [Number(m[1]), Number(m[2])];
      }
    }
    if (current && current.name && current.coords) {
      entries.push({ id: current.id, name: current.name, x: current.coords[0], y: current.coords[1] });
    }

    // simple name matching (case-insensitive, contains)
    const results: { id: string; name: string; x: number; y: number }[] = [];
    const lower = names.map(n => n.toLowerCase());
    for (const entry of entries) {
      if (lower.some(n => entry.name.toLowerCase().includes(n))) {
        results.push(entry);
      }
    }
    return results;
  } catch {
    return [];
  }
}


