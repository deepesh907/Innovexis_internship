// api/transcribe/route.js - UPDATED VERSION
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");

        console.log("📥 Incoming file details:");
        console.log("- Name:", file?.name);
        console.log("- Type:", file?.type);
        console.log("- Size:", file?.size, "bytes");

        if (!file) {
            return NextResponse.json(
                { error: "No audio file received" },
                { status: 400 }
            );
        }

        const apiKey = process.env.ASSEMBLYAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Missing AssemblyAI key" },
                { status: 500 }
            );
        }

        // Convert uploaded file → Buffer
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = Buffer.from(arrayBuffer);

        console.log("📡 Uploading to AssemblyAI...");

        // Upload to AssemblyAI
        const uploadRes = await fetch("https://api.assemblyai.com/v2/upload", {
            method: "POST",
            headers: {
                authorization: apiKey,
                "content-type": "application/octet-stream"
            },
            body: audioBuffer
        });

        const uploadData = await uploadRes.json();
        console.log("📡 Upload response:", uploadData.upload_url ? "Success" : "Failed");

        if (!uploadData.upload_url) {
            return NextResponse.json(
                { error: "Upload failed", details: uploadData },
                { status: 500 }
            );
        }

        console.log("🎯 Starting transcription...");

        // Start transcription with better configuration
        const transcriptRes = await fetch("https://api.assemblyai.com/v2/transcript", {
            method: "POST",
            headers: {
                authorization: apiKey,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                audio_url: uploadData.upload_url,
                // Add these parameters for better results
                language_detection: true,
                format_text: true,
                punctuate: true,
                // Add speech model
                speech_model: "best" // or "nano" for faster results
            })
        });

        const transcriptData = await transcriptRes.json();
        console.log("📝 Transcript started:", transcriptData.id);
        console.log("📝 Status:", transcriptData.status);

        // Poll until transcript completes
        let maxAttempts = 30; // 60 seconds max (30 * 2 seconds)
        let attempts = 0;
        let completedText = "";

        while (attempts < maxAttempts) {
            attempts++;
            await new Promise((r) => setTimeout(r, 2000));

            const checkRes = await fetch(
                `https://api.assemblyai.com/v2/transcript/${transcriptData.id}`,
                { headers: { authorization: apiKey } }
            );

            const checkData = await checkRes.json();
            console.log(`🔄 Attempt ${attempts}:`, checkData.status);

            if (checkData.status === "completed") {
                completedText = checkData.text || "";
                console.log("✅ Transcription completed:", completedText.substring(0, 100) + "...");
                break;
            }

            if (checkData.status === "error") {
                console.error("❌ Transcription error:", checkData.error);
                return NextResponse.json(
                    { error: "Transcription error", details: checkData.error },
                    { status: 500 }
                );
            }
        }

        if (!completedText && attempts >= maxAttempts) {
            return NextResponse.json(
                { error: "Transcription timeout" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            text: completedText || "No speech detected",
            status: "completed"
        });

    } catch (err) {
        console.error("❌ ERROR:", err);
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}