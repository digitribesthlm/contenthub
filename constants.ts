// N8N Webhook Endpoints - loaded from environment variables
export const N8N_WEBHOOK_NEW_BRIEF = import.meta.env.VITE_N8N_WEBHOOK_NEW_BRIEF || 'https://n8n.digitribe.se/webhook/b28';
export const N8N_WEBHOOK_PUBLISH = import.meta.env.VITE_N8N_WEBHOOK_PUBLISH || 'https://n8n.digitribe.se/webhook/b2c60e8';
export const N8N_WEBHOOK_SCHEDULE = import.meta.env.VITE_N8N_WEBHOOK_SCHEDULE || 'https://n8n.digitribe.se/webhook/b28f028d-3429-4280-a0f0-8afa263c60e8';
