// One-off: create a "Preview Family" so we can view the RSVP page.
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);
const token = "preview-family-001";

await sql`
  INSERT INTO families (name, max_attendees, rsvp_token, status)
  VALUES ('Mehul', 4, ${token}, 'pending')
  ON CONFLICT (rsvp_token) DO UPDATE SET name = 'Mehul', max_attendees = 4
`;

console.log(`Open: /rsvp/${token}`);
