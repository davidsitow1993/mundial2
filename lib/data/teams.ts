export type Team = {
  id: string;
  name: string;
  group: string;
  attack: number; // expected goals scored vs average opponent
  defense: number; // expected goals conceded vs average opponent (lower = better)
  isHost?: boolean;
};

// Ratings derived from FIFA ranking tiers, World Cup qualification form and
// historical tournament performance. Used as Poisson lambda inputs.
export const TEAMS: Team[] = [
  // Group A
  { id: "mex", name: "Mexico", group: "A", attack: 1.35, defense: 1.05, isHost: true },
  { id: "rsa", name: "South Africa", group: "A", attack: 0.95, defense: 1.35 },
  { id: "kor", name: "South Korea", group: "A", attack: 1.4, defense: 1.05 },
  { id: "cze", name: "Czech Republic", group: "A", attack: 1.3, defense: 1.1 },
  // Group B
  { id: "can", name: "Canada", group: "B", attack: 1.3, defense: 1.1, isHost: true },
  { id: "bih", name: "Bosnia & Herzegovina", group: "B", attack: 1.2, defense: 1.15 },
  { id: "qat", name: "Qatar", group: "B", attack: 0.9, defense: 1.4 },
  { id: "che", name: "Switzerland", group: "B", attack: 1.45, defense: 1.0 },
  // Group C
  { id: "bra", name: "Brazil", group: "C", attack: 2.1, defense: 0.75 },
  { id: "mar", name: "Morocco", group: "C", attack: 1.5, defense: 0.95 },
  { id: "hai", name: "Haiti", group: "C", attack: 0.75, defense: 1.55 },
  { id: "sco", name: "Scotland", group: "C", attack: 1.3, defense: 1.05 },
  // Group D
  { id: "usa", name: "USA", group: "D", attack: 1.5, defense: 1.0, isHost: true },
  { id: "par", name: "Paraguay", group: "D", attack: 1.2, defense: 1.1 },
  { id: "aus", name: "Australia", group: "D", attack: 1.05, defense: 1.25 },
  { id: "tur", name: "Turkey", group: "D", attack: 1.35, defense: 1.05 },
  // Group E
  { id: "ger", name: "Germany", group: "E", attack: 1.95, defense: 0.8 },
  { id: "cur", name: "Curacao", group: "E", attack: 0.75, defense: 1.55 },
  { id: "civ", name: "Ivory Coast", group: "E", attack: 1.3, defense: 1.1 },
  { id: "ecu", name: "Ecuador", group: "E", attack: 1.25, defense: 1.05 },
  // Group F
  { id: "ned", name: "Netherlands", group: "F", attack: 1.8, defense: 0.85 },
  { id: "jpn", name: "Japan", group: "F", attack: 1.5, defense: 1.0 },
  { id: "swe", name: "Sweden", group: "F", attack: 1.35, defense: 1.05 },
  { id: "tun", name: "Tunisia", group: "F", attack: 1.1, defense: 1.2 },
  // Group G
  { id: "bel", name: "Belgium", group: "G", attack: 1.7, defense: 0.9 },
  { id: "egy", name: "Egypt", group: "G", attack: 1.15, defense: 1.2 },
  { id: "irn", name: "Iran", group: "G", attack: 1.05, defense: 1.2 },
  { id: "nzl", name: "New Zealand", group: "G", attack: 0.8, defense: 1.5 },
  // Group H
  { id: "esp", name: "Spain", group: "H", attack: 2.1, defense: 0.75 },
  { id: "cpv", name: "Cape Verde", group: "H", attack: 0.9, defense: 1.4 },
  { id: "ksa", name: "Saudi Arabia", group: "H", attack: 0.9, defense: 1.4 },
  { id: "ury", name: "Uruguay", group: "H", attack: 1.55, defense: 0.9 },
  // Group I
  { id: "fra", name: "France", group: "I", attack: 2.05, defense: 0.8 },
  { id: "sen", name: "Senegal", group: "I", attack: 1.35, defense: 1.05 },
  { id: "irq", name: "Iraq", group: "I", attack: 0.9, defense: 1.4 },
  { id: "nor", name: "Norway", group: "I", attack: 1.7, defense: 0.95 },
  // Group J
  { id: "arg", name: "Argentina", group: "J", attack: 2.0, defense: 0.7 },
  { id: "alg", name: "Algeria", group: "J", attack: 1.2, defense: 1.15 },
  { id: "aut", name: "Austria", group: "J", attack: 1.45, defense: 1.0 },
  { id: "jor", name: "Jordan", group: "J", attack: 0.85, defense: 1.45 },
  // Group K
  { id: "por", name: "Portugal", group: "K", attack: 1.9, defense: 0.85 },
  { id: "cod", name: "DR Congo", group: "K", attack: 1.1, defense: 1.25 },
  { id: "uzb", name: "Uzbekistan", group: "K", attack: 0.85, defense: 1.45 },
  { id: "col", name: "Colombia", group: "K", attack: 1.65, defense: 0.95 },
  // Group L
  { id: "eng", name: "England", group: "L", attack: 1.85, defense: 0.85 },
  { id: "hrv", name: "Croatia", group: "L", attack: 1.55, defense: 0.95 },
  { id: "gha", name: "Ghana", group: "L", attack: 1.05, defense: 1.3 },
  { id: "pan", name: "Panama", group: "L", attack: 0.95, defense: 1.35 },
];

export const GROUPS = Array.from(new Set(TEAMS.map((t) => t.group))).sort();

export function teamsByGroup(group: string): Team[] {
  return TEAMS.filter((t) => t.group === group);
}

export function teamById(id: string): Team | undefined {
  return TEAMS.find((t) => t.id === id);
}

export const TOP_SCORERS: Record<string, { id: string; name: string; share: number }[]> = {
  arg: [
    { id: "messi", name: "L. Messi", share: 0.32 },
    { id: "alvarez", name: "J. Alvarez", share: 0.22 },
    { id: "lautaro", name: "Lautaro Martinez", share: 0.2 },
  ],
  fra: [
    { id: "mbappe", name: "K. Mbappe", share: 0.35 },
    { id: "dembele", name: "O. Dembele", share: 0.18 },
    { id: "giroud2", name: "O. Giroud", share: 0.08 },
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
  ger: [
    { id: "havertz", name: "K. Havertz", share: 0.26 },
    { id: "muller", name: "T. Muller", share: 0.16 },
    { id: "gnabry", name: "S. Gnabry", share: 0.18 },
  ],
  nor: [
    { id: "haaland", name: "E. Haaland", share: 0.42 },
    { id: "odegaard", name: "M. Odegaard", share: 0.18 },
    { id: "sorloth", name: "A. Sorloth", share: 0.14 },
  ],
  ned: [
    { id: "depay", name: "M. Depay", share: 0.28 },
    { id: "gakpo", name: "C. Gakpo", share: 0.24 },
    { id: "bergwijn", name: "S. Bergwijn", share: 0.14 },
  ],
  col: [
    { id: "diaz", name: "L. Diaz", share: 0.28 },
    { id: "falcao", name: "R. Falcao", share: 0.2 },
    { id: "cuadrado", name: "J. Cuadrado", share: 0.16 },
  ],
  ury: [
    { id: "nunez", name: "D. Nunez", share: 0.34 },
    { id: "suarez", name: "L. Suarez", share: 0.22 },
    { id: "valverde", name: "F. Valverde", share: 0.14 },
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
