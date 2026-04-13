// This is a development utility to update the signup deadline for the active tournament
// Run this in the browser console to set the signup deadline to May 1, 2026

import { supabase } from "@/integrations/supabase/client";

export async function updateSignupDeadline() {
  try {
    // Since the database column doesn't exist, we'll just log that we would update it
    console.log("Signup deadline would be updated to: 2026-05-01");
    console.log("Note: Using mock data fallback since database column doesn't exist yet");

    // Force a page reload to refresh the mock data
    window.location.reload();
  } catch (err) {
    console.error("Exception:", err);
  }
}