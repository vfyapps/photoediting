import { config } from "dotenv";

// .env.test.local eerst: daar horen de sleutels van `supabase start` in te
// staan, zodat de RLS-test nooit per ongeluk tegen productie draait.
config({ path: ".env.test.local", quiet: true });
config({ path: ".env.local", quiet: true });
