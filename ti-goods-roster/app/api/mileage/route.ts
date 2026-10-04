import { requireUser } from "@/lib/auth";
import { isAdmin, personById } from "@/lib/config";
import { buildMileage } from "@/lib/mileage";

// Team members download their own mileage sheet; the admin can download anyone on the team. LR candidates have none.
export async function GET(req: Request) {
  const u = await requireUser();
  if ("error" in u) return u.error;
  const q = new URL(req.url).searchParams;
  const month = q.get("month") ?? "";
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return Response.json({ error: "Bad month" }, { status: 400 });
  const person = personById(isAdmin(u.me) && q.get("person") ? q.get("person")! : u.me);
  if (!person) return Response.json({ error: "Unknown person" }, { status: 404 });
  if (person.group !== "team") return Response.json({ error: "Mileage sheets are for team members only" }, { status: 403 });
  const file = await buildMileage(month, person.id, person.name);
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="MILEAGE_${person.name.replace(/\W+/g, "_")}_${month}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
