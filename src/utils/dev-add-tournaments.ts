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
          start_date: "2024-10-01",
          end_date: "2024-12-31",
          active: false,
        },
        {
          name: "Fall 2024 League",
          start_date: "2024-08-01",
          end_date: "2024-09-30",
          active: false,
        },
        {
          name: "Summer 2024 League",
          start_date: "2024-06-01",
          end_date: "2024-07-31",
          active: false,
        },
        {
          name: "Spring 2025 League",
          start_date: "2025-03-01",
          end_date: "2025-06-30",
          active: true,
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

export async function addTestProfiles() {
  try {
    // First, create auth users (this would normally be done by Supabase Auth)
    // For testing, we'll create profiles directly with proper UUIDs
    const { data, error } = await supabase
      .from("profiles")
      .insert([
        {
          user_id: "550e8400-e29b-41d4-a716-446655440001",
          display_name: "Alex Chen",
          elo: 1542,
        },
        {
          user_id: "550e8400-e29b-41d4-a716-446655440002",
          display_name: "Sarah Kim",
          elo: 1498,
        },
        {
          user_id: "550e8400-e29b-41d4-a716-446655440003",
          display_name: "Marcus Johnson",
          elo: 1455,
        },
        {
          user_id: "550e8400-e29b-41d4-a716-446655440004",
          display_name: "Emily Wang",
          elo: 1420,
        },
        {
          user_id: "550e8400-e29b-41d4-a716-446655440005",
          display_name: "Jake Rivera",
          elo: 1388,
        },
        {
          user_id: "550e8400-e29b-41d4-a716-446655440006",
          display_name: "Priya Patel",
          elo: 1365,
        },
        {
          user_id: "550e8400-e29b-41d4-a716-446655440007",
          display_name: "Tom Bradley",
          elo: 1310,
        },
        {
          user_id: "550e8400-e29b-41d4-a716-446655440008",
          display_name: "Nina Oswald",
          elo: 1265,
        },
      ])
      .select();

    if (error) {
      console.error("Error adding profiles:", error);
    } else {
      console.log("Successfully added profiles:", data);
      window.location.reload();
    }
  } catch (err) {
    console.error("Exception:", err);
  }
}
