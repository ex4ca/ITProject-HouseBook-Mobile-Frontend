import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function testAsTradie() {
  await supabase.auth.signInWithPassword({
      email: "tradie@example.com", // Assume nathan.frederick or tradie
      password: "password123"
  });

  const propertyId = "52b40919-cbe3-4d82-ae3e-0cf6848edff1"; 

  console.log("Fetching Property...");
  const { data: prop, error: propErr } = await supabase
    .from("Property")
    .select("property_id")
    .eq("property_id", propertyId)
    .single();
    
  console.log("Prop:", prop, "Err:", propErr?.message);

  console.log("Fetching PropertyImages...");
  const { data: images, error: imagesErr } = await supabase
    .from("PropertyImages")
    .select("*")
    .eq("property_id", propertyId);

  console.log("Images:", images, "Err:", imagesErr?.message);
}

testAsTradie();
