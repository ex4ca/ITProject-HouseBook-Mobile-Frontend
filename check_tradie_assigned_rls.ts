import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function testAsTradie() {
  await supabase.auth.signInWithPassword({
      email: "tradie@example.com", 
      password: "password123"
  });

  // Get user id
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return console.log("Failed to login");

  // Get tradie profile
  const { data: tradieProfile } = await supabase
    .from("Tradesperson")
    .select("tradie_id")
    .eq("user_id", userData.user.id)
    .single();

  if (!tradieProfile) return console.log("No tradie profile");

  // Get assigned jobs
  const { data: jobs } = await supabase
    .from("JobTradies")
    .select(`
        Jobs (
            Property (
               property_id
            )
        )
    `)
    .eq("tradie_id", tradieProfile.tradie_id)
    .eq("status", "ACCEPTED")
    .limit(1);

  const jobItem = jobs?.[0] as any;
  const propertyId = jobItem?.Jobs?.Property?.property_id;
  if (!propertyId) return console.log("No assigned properties found");

  console.log("Found assigned property ID:", propertyId);

  console.log("Testing fetchPropertyGeneralData query...");
  const { data: prop, error: propErr } = await supabase
    .from("Property")
    .select(`
        name,
        splash_image,
        PropertyImages ( image_link )
    `)
    .eq("property_id", propertyId)
    .single();
    
  console.log("Prop data returned via API:", JSON.stringify(prop, null, 2));
  console.log("Prop error:", propErr?.message);
}

testAsTradie();
