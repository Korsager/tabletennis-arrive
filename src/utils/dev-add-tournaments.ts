// This is a development utility to add test tournaments to Supabase
// Run this in the browser console or import it in your app temporarily

import { supabase } from "@/integrations/supabase/client";

export async function addTestTournaments() {
  try {
    const { data, error } = await supabase
      .from("tournaments")
      .insert([
        {
          name: "Winter 2024 League",
          description: "Winter season tournament",
          start_date: "2024-10-01",
          end_date: "2024-12-31",
          active: false,
        },
        {
          name: "Fall 2024 League",
          description: "Fall season tournament",
          start_date: "2024-08-01",
          end_date: "2024-09-30",
          active: false,
        },
        {
          name: "Summer 2024 League",
          description: "Summer season tournament",
          start_date: "2024-06-01",
          end_date: "2024-07-31",
          active: false,
        },
      ])
      .select();

    if (error) {
      console.error("Error adding tournaments:", error);
    } else {
      console.log("Successfully added tournaments:", data);
      window.location.reload();
    }
  } catch (err) {
    console.error("Exception:", err);
  }
}
