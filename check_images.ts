import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function checkImages() {
  const { data, error } = await supabase
    .from("PropertyImages")
    .select("property_id, image_link, image_name")
    .limit(5);

  console.log("PropertyImages:", data);

  const { data: props, error: propsError } = await supabase
    .from("Property")
    .select("property_id, splash_image")
    .limit(5);

  console.log("Properties (splash_image):", props);
}

checkImages();
