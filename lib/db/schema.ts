import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

export const rsvpStatusEnum = pgEnum("rsvp_status", ["pending", "yes", "no"]);

export const families = pgTable(
  "families",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    maxAttendees: integer("max_attendees").notNull(),
    rsvpToken: text("rsvp_token").notNull().unique(),
    status: rsvpStatusEnum("status").notNull().default("pending"),
    confirmedAttendees: integer("confirmed_attendees"),
    email: text("email"),
    phone: text("phone"),
    notes: text("notes"),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("families_status_idx").on(t.status)],
);

export type Family = typeof families.$inferSelect;
export type NewFamily = typeof families.$inferInsert;
