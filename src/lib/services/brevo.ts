const BREVO_EDGE_FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`

interface EmailPayload {
  to: string
  toName?: string
  subject: string
  htmlContent: string
  templateId?: number
  params?: Record<string, string>
}

interface SendEmailResponse {
  success: boolean
  messageId?: string
  error?: string
}

async function sendEmail(payload: EmailPayload): Promise<SendEmailResponse> {
  const response = await fetch(BREVO_EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new Error(`Brevo email failed: ${response.status} ${errorText}`)
  }

  return response.json()
}

export const emailService = {
  async sendVerificationEmail(email: string, name: string) {
    return sendEmail({
      to: email,
      toName: name,
      subject: 'Verify your Tally Health account',
      htmlContent: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 48px; height: 48px; background: #166534; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <span style="color: white; font-size: 24px;">🍎</span>
            </div>
            <h1 style="font-size: 24px; color: #1a1a1a; margin: 0;">Welcome to Tally Health</h1>
          </div>
          <p style="color: #666; line-height: 1.6; margin-bottom: 24px;">
            Hi ${name},<br/><br/>
            Thanks for signing up! Please verify your email address to start tracking your nutrition journey.
          </p>
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="{{{VERIFICATION_LINK}}}"
               style="display: inline-block; background: #166534; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">
            If you did not create this account, you can safely ignore this email.
          </p>
        </div>
      `,
    })
  },

  async sendWelcomeEmail(email: string, name: string) {
    return sendEmail({
      to: email,
      toName: name,
      subject: 'Welcome to Tally Health – Start Your Journey!',
      htmlContent: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 48px; height: 48px; background: #166534; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <span style="color: white; font-size: 24px;">🎉</span>
            </div>
            <h1 style="font-size: 24px; color: #1a1a1a; margin: 0;">Welcome, ${name}!</h1>
          </div>
          <p style="color: #666; line-height: 1.6; margin-bottom: 24px;">
            Your account is all set. Start tracking your meals, logging exercises, and hitting your goals.
          </p>
          <div style="background: #f5f5f5; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px; font-size: 16px; color: #1a1a1a;">Quick tips to get started:</h3>
            <ul style="color: #666; line-height: 1.8; padding-left: 20px; margin: 0;">
              <li>Complete your profile with your goals</li>
              <li>Log your first meal using Search or Quick Add</li>
              <li>Take a photo of your meal for AI analysis</li>
              <li>Track your water intake throughout the day</li>
            </ul>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">
            Happy tracking! — The Tally Health Team
          </p>
        </div>
      `,
    })
  },

  async sendPasswordResetEmail(email: string, name: string) {
    return sendEmail({
      to: email,
      toName: name,
      subject: 'Reset your Tally Health password',
      htmlContent: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 48px; height: 48px; background: #166534; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
              <span style="color: white; font-size: 24px;">🔐</span>
            </div>
            <h1 style="font-size: 24px; color: #1a1a1a; margin: 0;">Password Reset</h1>
          </div>
          <p style="color: #666; line-height: 1.6; margin-bottom: 24px;">
            Hi ${name},<br/><br/>
            We received a request to reset your password. Click the button below to create a new one.
          </p>
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="{{{RESET_LINK}}}"
               style="display: inline-block; background: #166534; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">
            If you did not request this, you can safely ignore this email.<br/>
            This link expires in 1 hour.
          </p>
        </div>
      `,
    })
  },

  async sendWeeklySummary(email: string, name: string, data: {
    totalCalories: number
    avgCalories: number
    streak: number
    mealsLogged: number
  }) {
    return sendEmail({
      to: email,
      toName: name,
      subject: 'Your Weekly Nutrition Summary',
      htmlContent: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; color: #1a1a1a; margin: 0;">Your Weekly Summary</h1>
            <p style="color: #666;">Hi ${name}, here's how your week went.</p>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
            <div style="background: #f0fdf4; border-radius: 12px; padding: 16px; text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #166534;">${data.totalCalories.toLocaleString()}</div>
              <div style="font-size: 12px; color: #666;">Total Calories</div>
            </div>
            <div style="background: #f0fdf4; border-radius: 12px; padding: 16px; text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #166534;">${data.avgCalories.toLocaleString()}</div>
              <div style="font-size: 12px; color: #666;">Daily Avg</div>
            </div>
            <div style="background: #fefce8; border-radius: 12px; padding: 16px; text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #a16207;">${data.streak}</div>
              <div style="font-size: 12px; color: #666;">Day Streak</div>
            </div>
            <div style="background: #eff6ff; border-radius: 12px; padding: 16px; text-align: center;">
              <div style="font-size: 28px; font-weight: 700; color: #1d4ed8;">${data.mealsLogged}</div>
              <div style="font-size: 12px; color: #666;">Meals Logged</div>
            </div>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">
            Keep up the great work! — The Tally Health Team
          </p>
        </div>
      `,
    })
  },

  async sendReminderEmail(email: string, name: string, type: 'meal' | 'water' | 'log') {
    const reminders = {
      meal: { title: 'Time to log your meal!', body: 'Don\'t forget to log what you ate.' },
      water: { title: 'Stay hydrated!', body: 'Time to drink some water.' },
      log: { title: 'Daily log reminder', body: 'Log your meals to keep your streak alive.' },
    }

    const reminder = reminders[type]

    return sendEmail({
      to: email,
      toName: name,
      subject: reminder.title,
      htmlContent: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-size: 20px; color: #1a1a1a; margin: 0;">${reminder.title}</h1>
            <p style="color: #666; margin-top: 8px;">${reminder.body}</p>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">
            — The Tally Health Team
          </p>
        </div>
      `,
    })
  },
}
