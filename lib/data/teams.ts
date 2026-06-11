export type Team = {
  id: string;
  name: string;
  group: string;
  attack: number; // expected goals scored vs average opponent
  defense: number; // expected goals conceded vs average opponent (lower = better)
  isHost?: boolean;
};

// Ratings are rough estimates derived from FIFA ranking tiers, used as
// Poisson model inputs (attack = goals-for strength, defense = goals-against strength).
export const TEAMS: Team[] = [
  // Group A
  { id: "mex", name: "Mexico", group: "A", attack: 1.35, defense: 1.05, isHost: true },
  { id: "pol", name: "Poland", group: "A", attack: 1.2, defense: 1.15 },
  { id: "irn", name: "Iran", group: "A", attack: 1.05, defense: 1.2 },
  { id: "rsa", name: "South Africa", group: "A", attack: 0.95, defense: 1.35 },
  // Group B
  { id: "can", name: "Canada", group: "B", attack: 1.3, defense: 1.1, isHost: true },
  { id: "esp", name: "Spain", group: "B", attack: 2.1, defense: 0.75 },
  { id: "hrv", name: "Croatia", group: "B", attack: 1.55, defense: 0.95 },
  { id: "ksa", name: "Saudi Arabia", group: "B", attack: 0.9, defense: 1.4 },
  // Group C
  { id: "usa", name: "USA", group: "C", attack: 1.5, defense: 1.0, isHost: true },
  { id: "fra", name: "France", group: "C", attack: 2.05, defense: 0.8 },
  { id: "aus", name: "Australia", group: "C", attack: 1.05, defense: 1.25 },
  { id: "qat", name: "Qatar", group: "C", attack: 0.9, defense: 1.4 },
  // Group D
  { id: "arg", name: "Argentina", group: "D", attack: 2.0, defense: 0.7 },
  { id: "nga", name: "Nigeria", group: "D", attack: 1.3, defense: 1.15 },
  { id: "isl", name: "Iceland", group: "D", attack: 1.1, defense: 1.2 },
  { id: "uae", name: "UAE", group: "D", attack: 0.85, defense: 1.45 },
  // Group E
  { id: "bra", name: "Brazil", group: "E", attack: 2.1, defense: 0.75 },
  { id: "che", name: "Switzerland", group: "E", attack: 1.45, defense: 1.0 },
  { id: "egy", name: "Egypt", group: "E", attack: 1.15, defense: 1.2 },
  { id: "jam", name: "Jamaica", group: "E", attack: 0.9, defense: 1.4 },
  // Group F
  { id: "ger", name: "Germany", group: "F", attack: 1.95, defense: 0.8 },
  { id: "col", name: "Colombia", group: "F", attack: 1.65, defense: 0.95 },
  { id: "jpn", name: "Japan", group: "F", attack: 1.5, defense: 1.0 },
  { id: "gha", name: "Ghana", group: "F", attack: 1.05, defense: 1.3 },
  // Group G
  { id: "por", name: "Portugal", group: "G", attack: 1.9, defense: 0.85 },
  { id: "mar", name: "Morocco", group: "G", attack: 1.5, defense: 0.95 },
  { id: "ury", name: "Uruguay", group: "G", attack: 1.55, defense: 0.9 },
  { id: "nzl", name: "New Zealand", group: "G", attack: 0.8, defense: 1.5 },
  // Group H
  { id: "eng", name: "England", group: "H", attack: 1.85, defense: 0.85 },
  { id: "sen", name: "Senegal", group: "H", attack: 1.35, defense: 1.05 },
  { id: "ecu", name: "Ecuador", group: "H", attack: 1.25, defense: 1.05 },
  { id: "pan", name: "Panama", group: "H", attack: 0.95, defense: 1.35 },
  // Group I
  { id: "ned", name: "Netherlands", group: "I", attack: 1.8, defense: 0.85 },
  { id: "blr", name: "Belgium", group: "I", attack: 1.7, defense: 0.9 },
  { id: "tun", name: "Tunisia", group: "I", attack: 1.1, defense: 1.2 },
  { id: "jor", name: "Jordan", group: "I", attack: 0.85, defense: 1.45 },
  // Group J
  { id: "ita", name: "Italy", group: "J", attack: 1.75, defense: 0.85 },
  { id: "den", name: "Denmark", group: "J", attack: 1.5, defense: 0.95 },
  { id: "civ", name: "Ivory Coast", group: "J", attack: 1.3, defense: 1.1 },
  { id: "uzb", name: "Uzbekistan", group: "J", attack: 0.85, defense: 1.45 },
  // Group K
  { id: "cro2", name: "Austria", group: "K", attack: 1.45, defense: 1.0 },
  { id: "ksw", name: "South Korea", group: "K", attack: 1.4, defense: 1.05 },
  { id: "alg", name: "Algeria", group: "K", attack: 1.2, defense: 1.15 },
  { id: "cur", name: "Curacao", group: "K", attack: 0.75, defense: 1.55 },
  // Group L
  { id: "scn", name: "Scotland", group: "L", attack: 1.3, defense: 1.05 },
  { id: "par", name: "Paraguay", group: "L", attack: 1.2, defense: 1.1 },
  { id: "crc", name: "Costa Rica", group: "L", attack: 1.1, defense: 1.2 },
  { id: "cpv", name: "Cape Verde", group: "L", attack: 0.9, defense: 1.4 },
];

export const GROUPS = Array.from(new Set(TEAMS.map((t) => t.group))).sort();

export function teamsByGroup(group: string): Team[] {
  return TEAMS.filter((t) => t.group === group);
}

export function teamById(id: string): Team | undefined {
  return TEAMS.find((t) => t.id === id);
}

// Top scorers per team, used to split team xG among players (goals per 90 ratio).
export const TOP_SCORERS: Record<string, { id: string; name: string; share: number }[]> = {
  arg: [
    { id: "messi", name: "L. Messi", share: 0.32 },
    { id: "alvarez", name: "J. Alvarez", share: 0.22 },
    { id: "lautaro", name: "Lautaro Martinez", share: 0.2 },
  ],
  fra: [
    { id: "mbappe", name: "K. Mbappe", share: 0.35 },
    { id: "dembele", name: "O. Dembele", share: 0.18 },
    { id: "tchouameni", name: "A. Tchouameni", share: 0.08 },
  ],
  bra: [
    { id: "vinicius", name: "Vinicius Jr", share: 0.3 },
    { id: "rodrygo", name: "Rodrygo", share: 0.18 },
    { id: "raphinha", name: "Raphinha", share: 0.2 },
  ],
  por: [
    { id: "ronaldo", name: "C. Ronaldo", share: 0.3 },
    { id: "leao", name: "R. Leao", share: 0.2 },
    { id: "fernandes", name: "B. Fernandes", share: 0.18 },
  ],
  eng: [
    { id: "kane", name: "H. Kane", share: 0.34 },
    { id: "saka", name: "B. Saka", share: 0.2 },
    { id: "foden", name: "P. Foden", share: 0.16 },
  ],
  esp: [
    { id: "yamal", name: "L. Yamal", share: 0.24 },
    { id: "williams", name: "N. Williams", share: 0.2 },
    { id: "morata", name: "A. Morata", share: 0.2 },
  ],
};

export function topScorersFor(teamId: string) {
  return (
    TOP_SCORERS[teamId] ?? [
      { id: `${teamId}-9`, name: "Delantero centro", share: 0.3 },
      { id: `${teamId}-7`, name: "Extremo derecho", share: 0.18 },
      { id: `${teamId}-11`, name: "Extremo izquierdo", share: 0.16 },
    ]
  );
}
