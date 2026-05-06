import { chat } from "@/lib/chat";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { query } = await req.json();
        const response = await chat(query);
        return NextResponse.json({ response });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}