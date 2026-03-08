import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { articles } = await req.json();
    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return new Response(JSON.stringify({ error: 'No articles provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Batch up to 20 articles at once
    const batch = articles.slice(0, 20);
    const articlesText = batch.map((a: any, i: number) =>
      `[${i}] "${a.title}" — ${(a.summary || '').slice(0, 150)}`
    ).join('\n');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a threat classification AI for a Middle East conflict monitoring dashboard. Classify each article into threat categories with confidence scores. Be accurate and concise.`
          },
          {
            role: "user",
            content: `Classify these articles:\n${articlesText}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "classify_articles",
              description: "Classify articles into threat categories with confidence scores",
              parameters: {
                type: "object",
                properties: {
                  classifications: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        index: { type: "number", description: "Article index from input" },
                        primary_category: {
                          type: "string",
                          enum: ["military", "humanitarian", "political", "economic", "cyber", "nuclear", "terrorism"],
                        },
                        confidence: { type: "number", description: "0-1 confidence score" },
                        threat_level: {
                          type: "string",
                          enum: ["critical", "high", "medium", "low", "info"],
                        },
                        tags: {
                          type: "array",
                          items: { type: "string" },
                          description: "1-3 specific tags like 'airstrike', 'displacement', 'sanctions'"
                        },
                      },
                      required: ["index", "primary_category", "confidence", "threat_level", "tags"],
                      additionalProperties: false,
                    }
                  }
                },
                required: ["classifications"],
                additionalProperties: false,
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "classify_articles" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, try again later' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: 'Classification failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: 'No classification returned' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const classifications = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(classifications), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error("classify-threat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
