
import { GoogleGenAI } from "@google/genai";
import { Device } from "../types";

// Always initialize with the structured apiKey parameter from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeDeviceWithGemini = async (device: Device): Promise<string> => {
    // Check for API key presence to provide a graceful error
    if (!process.env.API_KEY) {
        return "Error: Gemini API key is not configured in the environment.";
    }

    // Using gemini-3-flash-preview for fast, intelligent security analysis
    const model = 'gemini-3-flash-preview';
    
    const prompt = `
        Act as a world-class senior cybersecurity engineer for an Enterprise Wi-Fi Intrusion Detection System (IDS).
        Perform a deep behavioral analysis on the following network entity and identify why it triggered our heuristics.
        Provide a professional, technical, yet readable analysis in plain text.

        Structure your response clearly:
        1. THREAT CLASSIFICATION: (Minimal/Low/Medium/High/Critical)
        2. BEHAVIORAL ANOMALY DETECTION: Detail how this device's current activity (Data rate: ${device.behaviorProfile.avgDataPerTick} KB/scan, RSSI: ${device.rssi} dBm) deviates from its baseline or standard device profiles for a ${device.deviceType}.
        3. ATTACK VECTOR HYPOTHESIS: If suspicious, what specific type of attack might this represent (e.g., MAC Spoofing, Evil Twin, Data Exfiltration, or unauthorized IoT bridge)?
        4. MITIGATION STRATEGY: 3 technical steps for the SOC team.

        Entity Context:
        - MAC: ${device.mac}
        - Vendor: ${device.vendor}
        - IP: ${device.ip}
        - Type: ${device.deviceType}
        - Calculated Threat Score: ${device.threatScore}/100
        - Flagged Reason: ${device.suspicionReason || "Standard Monitoring"}
        - Baseline Profile Established: ${device.behaviorProfile.established}
        - Data Transmitted: ${Math.round(device.behavior.dataTransmitted / 1024)} MB
        - Typical Connection Hour: ${device.behaviorProfile.avgConnectionHour ? `${Math.round(device.behaviorProfile.avgConnectionHour)}:00 UTC` : 'Calculating...'}
        - Recent Signal Strength: ${device.rssiHistory.slice(-5).join(', ')} dBm
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
            }
        });

        // Use the .text property directly as per @google/genai latest guidelines
        const text = response.text;
        if (text) {
            return text;
        } else {
            return "Intelligence engine returned an empty response. Please retry the analysis.";
        }
    } catch (error) {
        console.error("Gemini Security Analysis Error:", error);
        if (error instanceof Error) {
            return `SECURITY ENGINE ERROR: ${error.message}`;
        }
        return "An unexpected error occurred within the neural analysis engine.";
    }
};
