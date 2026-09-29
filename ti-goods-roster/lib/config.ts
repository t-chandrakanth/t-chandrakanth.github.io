export type Person = {
  id: string;
  name: string;
  group: "team" | "lr";
};

export const ADMIN_ID = "raghav";

export const PEOPLE: Person[] = [
  { id: "raghav", name: "Raghav", group: "team" },
  { id: "mahesh", name: "Mahesh", group: "team" },
  { id: "vishnu", name: "Vishnu", group: "team" },
  { id: "narendra", name: "Narendra", group: "team" },
  { id: "subbareddy", name: "Subbareddy", group: "lr" },
  { id: "teja", name: "Teja", group: "lr" },
];

// Duty codes follow the existing muster sheet.
export const SHIFTS = [
  { code: "08/20", label: "General 08-20" },
  { code: "07/13", label: "Day 07-13" },
  { code: "13/21", label: "Afternoon 13-21" },
  { code: "21/24", label: "Night 21-00" },
  { code: "00/07", label: "Night off 00-07" },
  { code: "07/13 21/24", label: "Day + Night" },
  { code: "REST", label: "Rest" },
  { code: "LEAVE", label: "Leave" },
];

// Usual rotation for the four team members: General 08-20 -> direct Night 21-00 -> Night off 00-07 -> Rest -> General
export const CYCLE = ["08/20", "21/24", "00/07", "REST"];

export const isAdmin = (id?: string | null) => id === ADMIN_ID;
export const personById = (id: string) => PEOPLE.find((p) => p.id === id);
