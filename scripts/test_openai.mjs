/**
 * Smoke test OpenAI API.
 * Chạy: node --env-file=.env.local scripts/test_openai.mjs
 */

import { requireEnv } from './lib/env.mjs';

const API_KEY = requireEnv('OPENAI_API_KEY');
const BASE_URL = 'https://api.openai.com/v1';

async function testOpenAI() {
  try {
    console.log(`Using BASE_URL: ${BASE_URL}`);

    // Try chat completion
    const completionRes = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', 
        messages: [{ role: 'user', content: 'Say hello in Vietnamese' }],
        max_tokens: 50
      })
    });
    
    if (completionRes.ok) {
      const completionData = await completionRes.json();
      console.log('Chat completion output:', completionData.choices?.[0]?.message?.content);
    } else {
      console.log('Chat completion failed:', completionRes.status, await completionRes.text());
    }
    
  } catch (err) {
    console.error('Error testing OpenAI:', err);
  }
}

testOpenAI();
