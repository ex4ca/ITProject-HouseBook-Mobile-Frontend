import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function checkBuckets() {
  const { data, error } = await supabase.storage.listBuckets();
  console.log("Buckets:", data?.map(b => b.name));
}

checkBuckets();
