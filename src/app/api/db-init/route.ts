import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Cloudflare Worker environment
    // OpenNext exposes env bindings here:
    // @ts-ignore
    const env = (globalThis as any).__ENV__;

    if (!env || !env.DB) {
      return NextResponse.json(
        { error: "D1 database binding 'DB' not found" },
        { status: 500 }
      );
    }

    // Example: Create table if not exists
    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        address TEXT,
        category TEXT,
        lat REAL,
        lng REAL,
        website TEXT,
        rating REAL,
        hours TEXT,
        photo TEXT
      );
    `);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}