import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface AiFeedback {
  encouragement: string;
  insight: string;
  suggestion: string;
}

export async function generateParentingFeedback(
  title: string | null,
  content: string,
  mood: string | null,
  childAge?: number,
  childTraits?: string[]
): Promise<AiFeedback> {
  const ageContext = childAge ? `The child is ${Math.floor(childAge / 12)} years and ${childAge % 12} months old.` : '';
  const traitsContext = childTraits && childTraits.length > 0 
    ? `The child's personality traits include: ${childTraits.join(', ')}.` 
    : '';

  const prompt = `You are a warm, emotionally intelligent parenting coach. Reflect on this journal entry: "${content}". ${ageContext} ${traitsContext}

Please provide a supportive response in JSON format with exactly these fields:
- encouragement: Warm emotional validation and encouragement for the parent's feelings and experiences (2-3 sentences)
- insight: A practical insight or gentle reframe about the situation that helps the parent see it differently (2-3 sentences)  
- suggestion: One specific, actionable suggestion for future parenting behavior that's appropriate for the child's age (2-3 sentences)

Keep your tone warm, empathetic, and non-judgmental. Focus on practical wisdom and emotional support.`;

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
      encouragement: result.encouragement || "Your feelings and experiences as a parent are completely valid. You're doing better than you think.",
      insight: result.insight || "Every parenting challenge is an opportunity to learn and grow together with your child.",
      suggestion: result.suggestion || "Consider taking small steps and being patient with yourself and your child."
    };
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    
    // Check if it's an API key issue
    if (error.message?.includes('401') || error.message?.includes('authentication')) {
      throw new Error("OpenAI API key not configured. Please add your OPENAI_API_KEY to enable AI feedback.");
    }
    
    // Check if it's a rate limit or quota issue
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      throw new Error("OpenAI API quota exceeded. Please check your usage limits.");
    }
    
    throw new Error("Failed to generate AI feedback. Please try again later.");
  }
}
