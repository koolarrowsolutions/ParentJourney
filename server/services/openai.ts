import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface AiFeedback {
  validation: string;
  suggestion: string;
  growth: string;
  summary: string;
}

export async function generateParentingFeedback(
  title: string | null,
  content: string,
  mood: string | null
): Promise<AiFeedback> {
  const prompt = `You are a compassionate parenting coach and child development expert. A parent has shared their journal entry with you. Please provide supportive, practical feedback in JSON format.

Journal Entry:
Title: ${title || "No title"}
Content: ${content}
Mood: ${mood || "Not specified"}

Please respond with a JSON object containing:
- validation: A supportive message acknowledging their feelings and experience (2-3 sentences)
- suggestion: One practical, actionable suggestion they can try (2-3 sentences)
- growth: How this experience contributes to their growth as a parent (1-2 sentences)
- summary: A brief encouraging summary (1-2 sentences)

Keep the tone warm, non-judgmental, and encouraging. Focus on practical parenting advice based on child development principles.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert parenting coach providing supportive feedback to parents. Always respond with valid JSON in the exact format requested."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      validation: result.validation || "Your feelings and experiences as a parent are completely valid.",
      suggestion: result.suggestion || "Consider taking small steps and being patient with yourself and your child.",
      growth: result.growth || "Every challenge is an opportunity for growth in your parenting journey.",
      summary: result.summary || "You're doing better than you think, and your awareness shows your dedication as a parent."
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate AI feedback: " + (error as Error).message);
  }
}
