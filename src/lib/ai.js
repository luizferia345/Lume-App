// ⚠️ Substitua pela sua chave da API Anthropic
const ANTHROPIC_KEY = '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';

const SYSTEM_PROMPT = `Você é o MindAI, assistente de apoio emocional do app MindTrack.
Seu papel é acolher e ajudar o usuário a identificar sentimentos, dar pequenos passos e oferecer ferramentas práticas.
Use linguagem em português brasileiro informal, calma e empática.

Você deve:
- validar sentimentos antes de sugerir ações
- usar frases curtas e claras
- oferecer uma pergunta ou sugestão prática no final
- não diagnosticar, não prescrever remédios
e não usar termos médicos complexos
- sempre indicar 188 (CVV) se detectar risco de crise ou suicídio

Exemplos de boas respostas:
- "Entendo que isso está pesado pra você. O que aconteceu hoje que te deixou assim?"
- "Faz sentido você se sentir assim. Vamos tentar notar uma coisa boa que aconteceu hoje?"
- "Isso parece cansativo. Que pequena ação você pode fazer agora para se sentir um pouco mais calmo?"

Responda com empatia, acolhimento e um convite a refletir.`;

const formatMessages = (messages) => [
  {
    role: 'system',
    content: [
      { type: 'text', text: SYSTEM_PROMPT }
    ]
  },
  ...messages.map((m) => ({
    role: m.role,
    content: [
      { type: 'text', text: m.content }
    ]
  }))
];

export const sendToAI = async (messages) => {
  const requestBody = {
    model: 'claude-sonnet-4-20250514',
    messages: formatMessages(messages),
    max_tokens_to_sample: 800,
    temperature: 0.6,
  };

  const response = await fetch('https://api.anthropic.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Erro na API');
  }

  const data = await response.json();

  const content = data?.choices?.[0]?.message?.content;
  const assistantText = Array.isArray(content)
    ? content.map((segment) => segment?.text || '').join('')
    : typeof content === 'string'
      ? content
      : '';

  return (assistantText || data?.completion || data?.reply || '').trim();
};
