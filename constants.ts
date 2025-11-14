// All URLs are loaded from environment variables - NO HARDCODED VALUES!

export const N8N_WEBHOOK_NEW_BRIEF = import.meta.env.N8N_WEBHOOK_NEW_BRIEF || '';
export const N8N_WEBHOOK_PUBLISH = import.meta.env.N8N_WEBHOOK_PUBLISH || '';
export const N8N_WEBHOOK_SCHEDULE = import.meta.env.N8N_WEBHOOK_SCHEDULE || '';

// Validate that webhooks are configured
if (!N8N_WEBHOOK_NEW_BRIEF || !N8N_WEBHOOK_PUBLISH || !N8N_WEBHOOK_SCHEDULE) {
  console.warn('⚠️  N8N webhooks not fully configured. Add these to your .env.local:');
  console.warn('   N8N_WEBHOOK_NEW_BRIEF=your_webhook_url');
  console.warn('   N8N_WEBHOOK_PUBLISH=your_webhook_url');
  console.warn('   N8N_WEBHOOK_SCHEDULE=your_webhook_url');
}
