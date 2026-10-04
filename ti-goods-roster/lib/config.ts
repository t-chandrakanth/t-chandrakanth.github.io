export type Person = {
  id: string;
  name: string;
  group: "team" | "lr";
  color: string;
};

export type Team = {
  id: string;        // short key; also prefixes the storage keys of every team except the first
  title: string;     // app name shown on the login screen and in the header
  short: string;     // home-screen name
  adminId: string;   // the one person who sets duties and approves requests
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
      { id: "narendra", name: "Narendra", group: "team", color: "#8a3fd0" },
      { id: "subbareddy", name: "Subbareddy", group: "lr", color: "#b0356b" },
      { id: "teja", name: "Teja", group: "lr", color: "#0a7fa8" },
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
];

export const TEAM: Team = TEAMS.find((t) => t.id === process.env.NEXT_PUBLIC_TEAM) ?? TEAMS[0];
export const PEOPLE = TEAM.people;
export const ADMIN_ID = TEAM.adminId;
export const ADMIN_NAME = PEOPLE.find((p) => p.id === ADMIN_ID)?.name ?? "the chief";
export const APP_TITLE = TEAM.title;
// The first team's data was stored before teams existed, so its keys stay unprefixed.
export const STORE_PREFIX = TEAM === TEAMS[0] ? "" : `${TEAM.id}:`;

// Duty codes follow the existing muster sheet.
export const SHIFTS = [
  { code: "08/20", label: "General 08-20" },
  { code: "07/13", label: "Day 07-13" },
  { code: "13/21", label: "Afternoon 13-21" },
  { code: "21/24", label: "Night 21-00" },
  { code: "00/07", label: "Night off 00-07" },
  { code: "07/13 21/24", label: "Day + Night" },
  { code: "REST", label: "Rest" },
  { code: "CR", label: "Compensatory rest" },
  { code: "LEAVE", label: "Leave" },
];

// Usual rotation for the four team members: General 08-20 -> direct Night 21-00 -> Night off 00-07 -> Rest -> General
export const CYCLE = ["08/20", "21/24", "00/07", "REST"];

export const isAdmin = (id?: string | null) => id === ADMIN_ID;
export const personById = (id: string) => PEOPLE.find((p) => p.id === id);
