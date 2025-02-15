import { min, pipeline } from '@xenova/transformers';

// Use a small model that can run in the browser
const MODEL_NAME = 'Qwen/Qwen2.5-0.5B';
let generator: any;

async function initializeModel() {
  generator = await pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Chat');
}

const prompt = `Create a concise blog description using ONLY this text:

Instructions:
1. Start with "You'll discover: [description]"
2. Use only exact phrases from the text
3. Keep it under 10 words
4. If text is short (<15 words) or unclear, return it unchanged

Text to analyze:
`;

function stripMarkdown(content: string): string {
  // Remove markdown syntax
  return content
    .replace(/#{1,6}\s?/g, '')
    .replace(/\*{1,2}(.*?)\*{1,2}/g, '$1')
    .replace(/!\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/`{3}.*\n/g, '')
    .replace(/`/g, '');
}

export async function generateDescription(mdContent: string): Promise<string> {
  if (!generator) await initializeModel();
  const messages = [
    { role: 'system', content: 'You are a helpful copywritter.' },
    { role: 'user', content: prompt + stripMarkdown(mdContent).substring(0, 500)}
  ]
  
  const text = generator.tokenizer.apply_chat_template(messages, {
    tokenize: false,
    add_generation_prompt: true,
  });
  
  
  const output = await generator(text, {
    max_new_tokens: 30,
    min_new_tokens: 16,
    do_sample: false,
    return_full_text: false,
});

  return output[0].generated_text.trim();
}