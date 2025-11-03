import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenAI } from "@google/genai";
import { GeoAnalysisResult } from "@/types/types";

//Please change the prompt based on your preferences

const createBasePrompt = (modelName: string, styleDescription: string) =>{
    return `You are an expert in Generative Engine Optimization (GEO) and Search Engine Optimization (SEO). Your task is to analyze a user's website URL based on a given query and target keywords. Then, provide actionable recommendations to improve the website's visibility in AI-powered search results and traditional search engines.

Your response should be in the style of ${modelName}. ${styleDescription}

First, provide a detailed GEO and SEO analysis based on the query and keywords. Structure this with headings for "Analysis" and "Recommendations".

Second, perform an on-page SEO audit of the provided URL. Act as if you have crawled the page. Evaluate its structure and content for SEO best practices (e.g., title tags, meta descriptions, header hierarchy, content relevance, keyword usage). If the implementation is strong, acknowledge it. If there are weaknesses, provide specific, actionable suggestions for improvement. Structure this part under a clear "On-Page SEO Audit" heading.

(Note: You may not have live internet access. Base your analysis on the provided query and keywords, and your existing knowledge about the URL's content and general SEO principles.)`;

};

//Please change the prompt based on your preferences

const createSystemPrompt = (modelName: string, styleDescription:string) => {
    return `You are an expert in Generative Engine Optimization (GEO) and Search Engine Optimization (SEO). Your task is to provide analysis and recommendations in the style of ${modelName}. ${styleDescription}
    
Your output must be in Markdown format.

It should contain two main parts:
1. A GEO/SEO analysis based on the user's query and keywords, with "Analysis" and "Recommendations" sections.
2. An "On-Page SEO Audit" of the user's provided URL. For this part, act as if you've crawled the page. Analyze its on-page SEO elements (titles, metas, headers, etc.). State what is done well and provide clear suggestions for what can be improved for both traditional web search and AI-driven search.`;
}

const createUserPrompt = (query: string, keywords: string, url: string) =>{
    return `Here is the user's request:
    - Query: "${query}"
    - Target Keywords: "${keywords}"
    - Website URL: "${url}"

    Please provide your GEO & SEO analysis based on these inputs.`;
}

const getGeminiGeoAnalysis = async (query: string,keywords: string, url: string ): Promise<string> =>{

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey){
        throw new Error("Gemini API key not found, Please add the key in the .env file");
    }
    const ai = new GoogleGenAI({apiKey});

    const systemInstruction = createBasePrompt (
        "Gemini",
        "Provide a deep,data-driven analysis. Focus on structured data, content depth, E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness), and how the content can be used to answer nuanced user questions. Give clear, actionable steps."
    );
    const userPrompt = createUserPrompt(query, keywords, url);
    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: userPrompt,
        config: {systemInstruction}
    });
    return response.text || "No response generated from Gemini";

};

const getChatGptGeoAnalysis = async (query: string, keywords: string, url: string): Promise<string> =>{
    const openAiApiKey = process.env.OPENAI_API_KEY;
    if(!openAiApiKey){
        throw new Error("Open API key not found, Please add the key in the .env file");
    }
    const systemPrompt = createSystemPrompt(
        "ChatGPT",
        "Offer a conversational, easy-to-understand analysis. Use bullet points and checklists. Explain complex SEO/GEO concepts simply. The tone should be encouraging and user-friendly."
    );

    const userPrompt = createUserPrompt(query, keywords, url);

    const response = await fetch('https://api.openai.com/v1/chat/completions',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiApiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                {role: 'system', content: systemPrompt},
                {role: 'user', content: userPrompt},
            ],
            temperature: 0.7, // Controls the AI's "creativity"
        }),
    });

    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP Error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No Response From ChatGPT";

};

export default async function handler(
req: NextApiRequest,
res: NextApiResponse<GeoAnalysisResult | {error: string}>
) {
    if(req.method !== 'POST'){
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const {query, keywords, url} = req.body;

    if (!query || !keywords || !url){
        return res.status(400).json({error: "Missing required fields: query, keywords, and url"});
    }

    try{
        const [geminiResult, chatgptResult] = await Promise.allSettled([
            getGeminiGeoAnalysis(query,keywords,url),
            getChatGptGeoAnalysis(query,keywords,url),
        ]);

        const analysisResult : GeoAnalysisResult = {
            gemini: geminiResult.status === 'fulfilled'? geminiResult.value:`### Analysis Failed 😭\n\n**Reason:** ${(geminiResult.reason as Error).message}`,
            chatgpt: chatgptResult.status === 'fulfilled'? chatgptResult.value: `### Analysis Failed 😭\n\n**Reason:** ${(chatgptResult.reason as Error).message}`,
        };

        res.status(200).json(analysisResult);
    }
    catch(error){
        console.error("Error in Analyzer", error);
        res.status(500).json({error: "Internal Server error"});
    }
}
