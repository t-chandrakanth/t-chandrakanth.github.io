// Indian gazetted holidays. Fixed national days repeat every year;
// festival dates that follow the moon are listed per year (moon-sighted ones can shift by a day).
const FIXED: Record<string, string> = {
  "01-26": "Republic Day",
  "08-15": "Independence Day",
  "10-02": "Gandhi Jayanti",
  "12-25": "Christmas",
};

const BY_YEAR: Record<number, Record<string, string>> = {
  2026: {
    "03-04": "Holi",
    "03-21": "Id-ul-Fitr",
    "03-26": "Ram Navami",
    "03-31": "Mahavir Jayanti",
    "04-03": "Good Friday",
    "05-01": "Buddha Purnima",
    "05-28": "Bakrid",
    "06-26": "Muharram",
    "08-26": "Milad-un-Nabi",
    "09-04": "Janmashtami",
    "10-20": "Dussehra",
    "11-08": "Diwali",
    "11-24": "Guru Nanak Jayanti",
  },
};

export const holidayName = (date: string): string | undefined => {
  const md = date.slice(5);
  return BY_YEAR[+date.slice(0, 4)]?.[md] ?? FIXED[md];
};
