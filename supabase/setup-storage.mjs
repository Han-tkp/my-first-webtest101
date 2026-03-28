/**
 * Setup Supabase Storage bucket for equipment images
 * Run: node supabase/setup-storage.mjs
 *
 * Note: This requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 * You can find it in Supabase Dashboard > Settings > API > service_role key
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    console.log("\nAdd this to your .env.local:");
    console.log("SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here");
    console.log("\nFind it at: Supabase Dashboard > Settings > API > service_role key");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
});

async function setupStorage() {
    console.log("Setting up storage bucket...\n");

    // Create bucket
    const { data, error } = await supabase.storage.createBucket("equipment-images", {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
    });

    if (error) {
        if (error.message?.includes("already exists")) {
            console.log("Bucket 'equipment-images' already exists.");
        } else {
            console.error("Error creating bucket:", error.message);
            return;
        }
    } else {
        console.log("Created bucket 'equipment-images' successfully!");
    }

    console.log("\nStorage setup complete!");
    console.log("Images can be uploaded to: equipment-images/equipment/");
}

async function createAdminUser() {
    const adminEmail = process.argv[2];
    const adminPassword = process.argv[3];

    if (!adminEmail || !adminPassword) {
        console.log("\n--- Admin Setup (Optional) ---");
        console.log("To create an admin user, run:");
        console.log("  node supabase/setup-storage.mjs admin@email.com password123");
        return;
    }

    console.log(`\nCreating admin user: ${adminEmail}...`);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
            full_name: "Admin",
            role: "admin",
            status: "active",
        },
    });

    if (authError) {
        console.error("Error creating admin auth:", authError.message);
        return;
    }

    // Update profile to admin + active
    const { error: profileError } = await supabase
        .from("profiles")
        .update({ role: "admin", status: "active" })
        .eq("id", authData.user.id);

    if (profileError) {
        console.error("Error updating admin profile:", profileError.message);
        return;
    }

    console.log(`Admin user created! Email: ${adminEmail}`);
}

setupStorage()
    .then(() => createAdminUser())
    .catch(console.error);
