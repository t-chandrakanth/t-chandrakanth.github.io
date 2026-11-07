export type Person = {
  id: string;
  name: string;
  group: "team" | "lr";
  color: string;
  until?: string; // last day on this muster (YYYY-MM-DD). History stays; the person is hidden after it.
};

export type Team = {
  id: string;        // short key; also prefixes the storage keys of every team except the first
  title: string;     // app name shown on the login screen and in the header
  short: string;     // home-screen name
  adminId: string;   // the one person who sets duties and approves requests
  nightOff?: string; // code for the morning after a night duty; "00/08" unless the team says otherwise
  people: Person[];
};

// Each deployment picks its team with NEXT_PUBLIC_TEAM (Vercel → Settings → Environment Variables).
// Missing or unknown → the first team, so the original deployment keeps working unchanged.
export const TEAMS: Team[] = [
  {
    id: "ti-goods",
    title: "TI Goods Muster",
    short: "TI Muster",
    adminId: "raghav",
    people: [
      { id: "raghav", name: "Raghav", group: "team", color: "#2447d8" },
      { id: "mahesh", name: "Mahesh", group: "team", color: "#0e8f6e" },
      { id: "vishnu", name: "Vishnu", group: "team", color: "#c2571a" },
      { id: "narendra", name: "Narendra", group: "team", color: "#8a3fd0", until: "2026-10-06" }, // moved to other duties; Ravinder Goud took over
      { id: "ravinder", name: "Ravinder Goud", group: "team", color: "#00838f", until: "2026-11-07" }, // left TI Goods; history kept
      { id: "subbareddy", name: "Subbareddy", group: "lr", color: "#b0356b" },
      { id: "teja", name: "Teja", group: "lr", color: "#0a7fa8", until: "2026-11-07" }, // left TI Goods; history kept
    ],
  },
  {
    id: "victor",
    title: "MLA Muster",
    short: "MLA Muster",
    adminId: "victor",
    people: [
      { id: "victor", name: "Victor Samuel", group: "team", color: "#2447d8" },
      { id: "murali", name: "Murali", group: "team", color: "#0e8f6e" },
      { id: "naresh", name: "Naresh", group: "team", color: "#c2571a" },
      { id: "aravind", name: "Aravind", group: "team", color: "#8a3fd0" },
    ],
  },
  {
    id: "coal",
    title: "Coal Asst Muster",
    short: "Coal Muster",
    adminId: "vijay",
    people: [
      { id: "vijay", name: "Vijay", group: "team", color: "#2447d8" },
      { id: "ravindra", name: "Ravindra", group: "team", color: "#0e8f6e" },
      { id: "sunil", name: "Sunil", group: "team", color: "#c2571a" },
      { id: "manisha", name: "Manisha", group: "team", color: "#8a3fd0" },
      { id: "bindu", name: "Bindu", group: "lr", color: "#b0356b" },
      { id: "adithya", name: "Adithya", group: "lr", color: "#0a7fa8" },
      { id: "jyothi", name: "Jyothi", group: "lr", color: "#7a6a00" },
    ],
  },
  {
    id: "sc-chasers",
    title: "SC Chasers Muster",
    short: "SC Chasers",
    adminId: "yamji",
    people: [
      { id: "yamji", name: "Yamji", group: "team", color: "#2447d8" },
      { id: "sumanth", name: "Sumanth", group: "team", color: "#0e8f6e" },
      { id: "rohan", name: "Rohan", group: "team", color: "#c2571a" },
      { id: "saisanthosh", name: "Sai Santhosh", group: "team", color: "#8a3fd0" },
      { id: "teja", name: "Teja", group: "lr", color: "#0a7fa8" },
    ],
  },
];

export const TEAM: Team = TEAMS.find((t) => t.id === process.env.NEXT_PUBLIC_TEAM) ?? TEAMS[0];
export const PEOPLE = TEAM.people;                                   // everyone ever on the muster (for history)
export const ACTIVE = PEOPLE.filter((p) => !p.until);               // on the muster today
export const activeOn = (p: Person, date: string) => !p.until || date <= p.until;
export const ADMIN_ID = TEAM.adminId;
export const ADMIN_NAME = PEOPLE.find((p) => p.id === ADMIN_ID)?.name ?? "the chief";
export const APP_TITLE = TEAM.title;
// The first team's data was stored before teams existed, so its keys stay unprefixed.
export const NIGHT_OFF = TEAM.nightOff ?? "00/08"; // from Nov 2026 every muster uses 00/08; earlier 00/07 days stay as entered
export const NIGHT_OFF_CODES = ["00/07", "00/08"]; // both read as Night off everywhere
export const STORE_PREFIX = TEAM === TEAMS[0] ? "" : `${TEAM.id}:`;

// Duty codes follow the existing muster sheet.
export const SHIFTS = [
  { code: "08/20", label: "General 08-20" },
  { code: "07/13", label: "Day 07-13" },
  { code: "13/21", label: "Afternoon 13-21" },
  { code: "21/24", label: "Night 21-00" },
  { code: NIGHT_OFF, label: `Night off 00-${NIGHT_OFF.slice(3)}` },
  { code: "07/13 21/24", label: "Day + Night" },
  { code: "REST", label: "Rest" },
  { code: "CR", label: "Compensatory rest" },
  { code: "LEAVE", label: "Leave" },
];


export const isAdmin = (id?: string | null) => id === ADMIN_ID;
export const personById = (id: string) => PEOPLE.find((p) => p.id === id);
