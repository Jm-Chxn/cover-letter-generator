// 1) Save the following LaTeX content as `coverLetter_Template.tex` in the same folder:
/*
%-------------------------
% Resume in Latex
% Author : Jake Gutierrez
% Based off of: https://github.com/sb2nov/resume
% License : MIT
%------------------------

\\documentclass[letterpaper,11pt]{article}
...
% (INSERT the full LaTeX template you provided, replacing static fields with these tokens:)
//   %%RECIPIENT_TITLE%%
//   %%COMPANY_NAME_FULL%%
//   %%COMPANY_NAME_SHORT%%
//   %%COMPANY_ADDRESS_LINE_1%%
//   %%COMPANY_ADDRESS_LINE_2%%
//   %%POSITION_TITLE%%
//   %%SESSION%%
//   %%JOB_POSTING_JOKE%%
//   %%COMPANY_MISSION%%
//   %%COMPANY_INNOVATION%%
//   %%COMPANY_VALUE_PROP%%
*/

// 2) TypeScript code to read template, fill tokens, and send to Gemini API via fetch
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import fetch from "node-fetch";
import dotenv from "dotenv";

// Configure environment variables
dotenv.config();

// ES Module file path handling
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Type definitions for API response
interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

async function main() {
  try {
    // Read template files
    console.log("Reading template files...");
    const templatePath = path.join(__dirname, "coverLetter_Template.tex");
    const schemaPath = path.join(__dirname, "coverLetter", "schema.ts");
    const jobPostingPath = path.join(__dirname, "jobposting.txt");

    console.log("Template path:", templatePath);
    console.log("Schema path:", schemaPath);
    console.log("Job posting path:", jobPostingPath);

    const texTemplate = fs.readFileSync(templatePath, "utf-8");
    const schema = fs.readFileSync(schemaPath, "utf-8");
    const onlineData = fs.readFileSync(jobPostingPath, "utf-8");

    // Get API key
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      throw new Error("Missing GEMINI_API_KEY in env");
    }

    // Build prompt
    const promptText = `You are an expert career coach and professional writer specializing in crafting compelling cover letters for software engineers. Your task is to analyze the job posting and create a personalized cover letter using the provided template.

Please analyze the job posting and extract the following information to fill in the template. Be specific and use exact details from the posting:

REQUIRED FIELDS (must be filled exactly as found in the posting):
- RECIPIENT_TITLE: Use the name of the person if a name is given, otherwise use "Hiring Manager"
- COMPANY_NAME_FULL: The complete company name
- COMPANY_NAME_SHORT: The company's shorter name or most commonly used name
- COMPANY_ADDRESS_LINE_1: The street address (format: "123 Street Name, Suite 100")
- COMPANY_ADDRESS_LINE_2: City, State/Province, ZIP/Postal (format: "Vancouver, BC V6B 1S4")
- POSITION_TITLE: The exact job title
- SESSION: The work term (e.g., "Summer 2024")
- JOB_POSTING_JOKE: If there's a casual/fun element in the posting, acknowledge it briefly. If none, leave empty.

COMPANY NARRATIVE (be specific and impactful):
- COMPANY_MISSION: Extract their core mission (15-20 words)
- COMPANY_INNOVATION: Highlight their unique technical approach or innovation (10-15 words)
- COMPANY_VALUE_PROP: Describe their main value proposition or user impact (10-15 words)

Experience and Projects (be specific and impactful for the second and thrid paragraphs relate to the job posting):
-based off of the following experience and projects, please write a narrative about my skills and how they align with the job posting for the second and thrid paragraphs
Student Club Software Engineer May - August 2024
SFU Gaming and Esports Club Burnaby, BC
• Designed and implemented a website utilizing React.js, TypeScript, and CSS for SFU Gaming Club which
amassed over 3800 members to expand club exposure
• Developed a responsive and user-friendly interface, enhancing accessibility and user engagement for club events and
activities by ensuring seamless navigation, and intuitive design
NFT Analyst September 2021 - September 2023
KingDom NFT Burnaby, BC
• Leveraged Web3 Technologies and blockchain integration tools to connect to decentralized networks and
automate NFT Trading, generated $150k US dollars in profits
• Minted and traded high-value NFTs on the Magic ecosystem (Arbitrum Layer 2), generating $50k US dollars in
profits by leveraging its low-cost, high-speed transaction capabilities.
• Analyzed NFT metadata using tools such as Moby and TraitSniper to pre-screen collections for rare traits,
enabling precise identification of high-value assets
• Utilized automated bots such as Breeze and Waifu to efficiently execute blockchain transactions, ensuring swift
acquisition of profitable NFTs during high-demand minting events, resulting in over $250k US dollars in volume
• Coordinated cross-project collaborations with different brands by aligning objectives with managers, fostering
partnerships to expand NFT initiatives
Projects
Foodie Find | React.js, Tailwind CSS, Firebase Realtime Database (NoSQL), Netlify February - April 2025
• Led a cross-functional Scrum team to design and launch a React-based web app for discovering hidden restaurants
leveraging React.js, Tailwind CSS, Firebase Realtime Database, and Google Maps API
• Directed unit and component testing with Vitest and React Testing Library, writing 20 tests that mock API calls to
validate UI rendering, user interactions, loading states, and error handling in the Gemini chat interface
• Implemented Firebase Realtime Database to enable real-time user submissions of restaurant recommendations
• Managed the Github repository and and served as Project Manager, overseeing branching strategy, pull request
flow, and CI/CD workflows; facilitated spring planning, weekly stand-ups, and retrospectives
Emergency Response | TypeScript, React.js, CSS, HTML, Shadcn API, Vercel October - December 2024
• Collaborated and led an Agile team to develop a web-based emergency response system, utilizing TypeScript,
React.js, CSS, HTML, and Shadcn API
• Integrated Shadcn API for component management and theming, streamlining design consistency and
maintainability, for a seamless application design
• Created entire concept for the webpage and design, assigned team members roles and outlined the architecture
• Developed an interactive form for users to input directions, contact information, and upload photos, ensuring
accurate and efficient emergency reporting
Quizify (FallHacks) | Python, React.js, Flask, HTML, CSS September - September 2024
• Designed and implemented an engaging and appealing user interface using React, optimizing performance and
usability to ensure a seamless and user-friendly experience
• Focused on optimizing performance and responsiveness of the React application, ensuring smooth user experience
• Built Flask API endpoints to serve both randomized quiz sets and full question collections as JSON, and enabled
cross-origin access for seamless React front-end integration

Use the provided LaTeX template below and replace all %%FIELD_NAME%% tokens with the appropriate content. Maintain all LaTeX formatting and commands exactly as shown. Return ONLY the filled template, no explanations or additional text.

<TEMPLATE>
${texTemplate}
</TEMPLATE>

<JOB_POSTING>
${onlineData}
</JOB_POSTING>

Return ONLY the complete LaTeX document with all tokens replaced with appropriate content. Preserve all LaTeX formatting and commands exactly as shown in the template.`;

    console.log("Sending request to Gemini API...");
    
    // Send request to Gemini API
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: promptText
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
            topP: 0.8,
            topK: 40
          }
        }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Gemini API error (${res.status}): ${errorText}`);
    }

    const data = await res.json() as GeminiResponse;
    console.log("API Response:", JSON.stringify(data, null, 2));

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Unexpected API response format");
    }

    const coverLetter = data.candidates[0].content.parts[0].text.trim();
    
    // Clean up the response to get just the LaTeX content
    const cleanedCoverLetter = coverLetter
      .replace(/```latex\n/, '')  // Remove leading latex tag
      .replace(/\n```$/, '')      // Remove trailing tag
      .trim();

    // Write output
    const outputPath = path.join(process.cwd(), "outputCoverLetter.tex");
    fs.writeFileSync(outputPath, cleanedCoverLetter);
    console.log(`✅ Cover letter written to: ${outputPath}`);

  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
