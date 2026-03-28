"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function SupabaseStatusPage() {
    const [configStatus, setConfigStatus] = useState<"checking" | "ok" | "error">("checking");
    const [connectionStatus, setConnectionStatus] = useState<"checking" | "ok" | "error">("checking");
    const [details, setDetails] = useState<string[]>([]);

    useEffect(() => {
        async function testSupabase() {
            const logs: string[] = [];

            // Step 1: Check configuration
            logs.push("1. Checking Supabase configuration...");
            const configured = isSupabaseConfigured();
            setConfigStatus(configured ? "ok" : "error");
            
            if (configured) {
                logs.push("   ✓ Configuration OK");
            } else {
                logs.push("   ✗ Configuration FAILED");
                logs.push("   Check .env.local file");
                setDetails(logs);
                setConnectionStatus("error");
                return;
            }

            // Step 2: Create client
            logs.push("2. Creating Supabase client...");
            const supabase = createClient();
            
            if (!supabase) {
                logs.push("   ✗ Failed to create client");
                setDetails(logs);
                setConnectionStatus("error");
                return;
            }
            logs.push("   ✓ Client created successfully");

            // Step 3: Test connection
            logs.push("3. Testing database connection...");
            try {
                const { error } = await supabase.from("profiles").select("id").limit(1);
                
                if (error) {
                    if (error.message.includes("relation") || error.message.includes("doesn't exist")) {
                        logs.push("   ⚠ Connected but 'profiles' table doesn't exist");
                        logs.push("   → Need to run database migration");
                        setConnectionStatus("ok");
                    } else {
                        logs.push(`   ✗ Database error: ${error.message}`);
                        setConnectionStatus("error");
                    }
                } else {
                    logs.push("   ✓ Database connection successful");
                    setConnectionStatus("ok");
                }
            } catch (err) {
                logs.push(`   ✗ Connection failed: ${err instanceof Error ? err.message : String(err)}`);
                setConnectionStatus("error");
            }

            setDetails(logs);
        }

        testSupabase();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
            <div className="glass-card max-w-2xl w-full p-8">
                <h1 className="text-3xl font-semibold mb-6 text-center">Supabase Status</h1>
                
                <div className="space-y-6">
                    {/* Configuration Status */}
                    <div className={`p-4 rounded-xl border-2 ${
                        configStatus === "ok" ? "border-green-500 bg-green-50" :
                        configStatus === "error" ? "border-red-500 bg-red-50" :
                        "border-yellow-500 bg-yellow-50"
                    }`}>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">
                                {configStatus === "ok" ? "✅" : configStatus === "error" ? "❌" : "⏳"}
                            </span>
                            <div>
                                <p className="font-semibold">Configuration Status</p>
                                <p className="text-sm opacity-80">
                                    {configStatus === "ok" ? "Environment variables configured correctly" :
                                     configStatus === "error" ? "Missing or invalid configuration" :
                                     "Checking configuration..."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Connection Status */}
                    <div className={`p-4 rounded-xl border-2 ${
                        connectionStatus === "ok" ? "border-green-500 bg-green-50" :
                        connectionStatus === "error" ? "border-red-500 bg-red-50" :
                        "border-yellow-500 bg-yellow-50"
                    }`}>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">
                                {connectionStatus === "ok" ? "✅" : connectionStatus === "error" ? "❌" : "⏳"}
                            </span>
                            <div>
                                <p className="font-semibold">Database Connection</p>
                                <p className="text-sm opacity-80">
                                    {connectionStatus === "ok" ? "Connected to Supabase" :
                                     connectionStatus === "error" ? "Failed to connect" :
                                     "Testing connection..."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    {details.length > 0 && (
                        <div className="bg-slate-800 text-white rounded-xl p-4 font-mono text-sm">
                            <p className="font-semibold mb-2">Connection Log:</p>
                            {details.map((line, i) => (
                                <p key={i} className="py-0.5">{line}</p>
                            ))}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <a href="/login" className="flex-1">
                            <button className="action-primary w-full py-3 rounded-xl">
                                Go to Login
                            </button>
                        </a>
                        <button 
                            onClick={() => window.location.reload()}
                            className="action-soft px-6 py-3 rounded-xl"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
