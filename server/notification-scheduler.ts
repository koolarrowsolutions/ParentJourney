import cron from 'node-cron';
import { db } from './db';
import { userNotificationSettings, users, journalEntries } from '../shared/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

interface NotificationData {
  userId: string;
  email: string;
  name: string;
  reminderTime: string;
  dailyReminder: boolean;
  weeklyProgress: boolean;
  notificationEmail: string;
}

// Email templates
const DAILY_REMINDER_TEMPLATE = {
  subject: "Your Daily ParentJourney Moment 🌟",
  getTextContent: (userName: string) => `
Hello ${userName},

It's time for your daily parenting reflection! Taking just a few minutes to document your parenting journey can help you:

• Track your growth as a parent
• Recognize positive patterns
• Process challenging moments
• Celebrate small victories

Ready to capture today's parenting moment?

Visit ParentJourney to start your reflection: ${process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.replit.app` : 'your ParentJourney app'}

Remember, every small moment matters in your parenting journey.

With support,
The ParentJourney Team
  `.trim(),
  
  getHtmlContent: (userName: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #4F46E5; margin: 0;">ParentJourney</h1>
        <p style="color: #6B7280; margin: 5px 0 0 0;">Your Daily Parenting Reflection</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 12px; text-align: center; margin-bottom: 25px;">
        <h2 style="margin: 0 0 10px 0; font-size: 24px;">Hello ${userName}! 🌟</h2>
        <p style="margin: 0; font-size: 16px; opacity: 0.9;">It's time for your daily parenting reflection</p>
      </div>
      
      <div style="background-color: #F8FAFC; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1E293B; margin: 0 0 15px 0;">Taking just a few minutes today can help you:</h3>
        <ul style="color: #475569; margin: 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;">Track your growth as a parent</li>
          <li style="margin-bottom: 8px;">Recognize positive patterns in your parenting</li>
          <li style="margin-bottom: 8px;">Process challenging moments with clarity</li>
          <li style="margin-bottom: 8px;">Celebrate the small victories that matter</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.replit.app` : '#'}" 
           style="background-color: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Start Your Reflection
        </a>
      </div>
      
      <div style="border-top: 1px solid #E2E8F0; padding-top: 20px; text-align: center;">
        <p style="color: #64748B; font-size: 14px; margin: 0;">Remember, every small moment matters in your parenting journey.</p>
        <p style="color: #64748B; font-size: 14px; margin: 10px 0 0 0;">With support, The ParentJourney Team</p>
      </div>
    </div>
  `
};

const WEEKLY_PROGRESS_TEMPLATE = {
  subject: "Your Weekly ParentJourney Progress 📊",
  getTextContent: (userName: string, stats: any) => `
Hello ${userName},

Here's your weekly parenting journey summary:

This Week's Highlights:
• ${stats.entriesThisWeek} journal entries logged
• ${stats.currentStreak} day interaction streak
• Most common mood: ${stats.topMood || 'Not analyzed'}
• Total parenting moments captured: ${stats.totalEntries}

${stats.recentEntry ? `Your most recent reflection: "${stats.recentEntry.title || 'Untitled'}" - ${stats.recentEntry.content.substring(0, 100)}...` : ''}

Keep up the wonderful work documenting your parenting journey! Every entry helps you grow and reflect.

Visit ParentJourney: ${process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.replit.app` : 'your ParentJourney app'}

Celebrating your progress,
The ParentJourney Team
  `.trim(),
  
  getHtmlContent: (userName: string, stats: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #4F46E5; margin: 0;">ParentJourney</h1>
        <p style="color: #6B7280; margin: 5px 0 0 0;">Your Weekly Progress Report</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 25px; border-radius: 12px; text-align: center; margin-bottom: 25px;">
        <h2 style="margin: 0 0 10px 0; font-size: 24px;">Hello ${userName}! 📊</h2>
        <p style="margin: 0; font-size: 16px; opacity: 0.9;">Here's your weekly parenting journey summary</p>
      </div>
      
      <div style="background-color: #F0F9FF; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0EA5E9;">
        <h3 style="color: #0C4A6E; margin: 0 0 15px 0;">This Week's Highlights:</h3>
        <div style="display: grid; gap: 12px;">
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E0F2FE;">
            <span style="color: #0369A1;">Journal entries logged:</span>
            <strong style="color: #0C4A6E;">${stats.entriesThisWeek}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E0F2FE;">
            <span style="color: #0369A1;">Current streak:</span>
            <strong style="color: #0C4A6E;">${stats.currentStreak} days</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E0F2FE;">
            <span style="color: #0369A1;">Most common mood:</span>
            <strong style="color: #0C4A6E;">${stats.topMood || 'Not analyzed'}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 0;">
            <span style="color: #0369A1;">Total moments captured:</span>
            <strong style="color: #0C4A6E;">${stats.totalEntries}</strong>
          </div>
        </div>
      </div>
      
      ${stats.recentEntry ? `
        <div style="background-color: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
          <h4 style="color: #92400E; margin: 0 0 10px 0;">Your Most Recent Reflection:</h4>
          <p style="color: #78350F; margin: 0; font-style: italic;">"${stats.recentEntry.title || 'Untitled'}"</p>
          <p style="color: #78350F; margin: 10px 0 0 0; font-size: 14px;">${stats.recentEntry.content.substring(0, 150)}...</p>
        </div>
      ` : ''}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.replit.app` : '#'}" 
           style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Continue Your Journey
        </a>
      </div>
      
      <div style="border-top: 1px solid #E2E8F0; padding-top: 20px; text-align: center;">
        <p style="color: #64748B; font-size: 14px; margin: 0;">Keep up the wonderful work documenting your parenting journey!</p>
        <p style="color: #64748B; font-size: 14px; margin: 10px 0 0 0;">Celebrating your progress, The ParentJourney Team</p>
      </div>
    </div>
  `
};

// Helper function to send email via Brevo
async function sendEmailViaBrevо(to: string, subject: string, textContent: string, htmlContent: string) {
  const brevoApiKey = process.env.BREVO_API_KEY;
  
  if (!brevoApiKey) {
    console.error('BREVO_API_KEY not configured - skipping email send');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': brevoApiKey
      },
      body: JSON.stringify({
        sender: {
          name: "ParentJourney",
          email: "koolarrowsolutions@gmail.com"
        },
        to: [{
          email: to,
          name: "Parent"
        }],
        subject,
        textContent,
        htmlContent
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Email sent successfully to ${to} (Message ID: ${data.messageId})`);
      return { success: true, messageId: data.messageId };
    } else {
      const errorText = await response.text();
      console.error(`❌ Failed to send email to ${to}:`, errorText);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error(`❌ Email sending error for ${to}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Get user stats for weekly progress
async function getUserStats(userId: string) {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Get all entries for this user
    const allEntries = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.familyId, userId))
      .orderBy(desc(journalEntries.createdAt));

    // Get entries from this week
    const thisWeekEntries = allEntries.filter(entry => 
      new Date(entry.createdAt) >= weekAgo
    );

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    let checkDate = new Date(today);
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const dayStart = new Date(checkDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(checkDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const hasEntryThisDay = allEntries.some(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate >= dayStart && entryDate <= dayEnd;
      });
      
      if (hasEntryThisDay) {
        currentStreak++;
      } else if (i > 0) { // Don't break on first day (might be early)
        break;
      }
      
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Get most common mood
    const moods = thisWeekEntries
      .map(entry => entry.aiAnalyzedMood || entry.mood)
      .filter((mood): mood is string => Boolean(mood));
    
    const moodCounts: Record<string, number> = moods.reduce((acc, mood) => {
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topMood = Object.keys(moodCounts).length > 0 
      ? Object.keys(moodCounts).reduce((a, b) => 
          moodCounts[a] > moodCounts[b] ? a : b
        )
      : null;

    return {
      entriesThisWeek: thisWeekEntries.length,
      currentStreak,
      topMood,
      totalEntries: allEntries.length,
      recentEntry: allEntries[0] || null
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      entriesThisWeek: 0,
      currentStreak: 0,
      topMood: null,
      totalEntries: 0,
      recentEntry: null
    };
  }
}

// Send daily reminders
async function sendDailyReminders() {
  try {
    console.log('🔔 Checking for daily reminder recipients...');
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // Find users who want daily reminders at this time
    const recipients = await db
      .select({
        userId: users.id,
        email: users.email,
        name: users.name,
        reminderTime: userNotificationSettings.reminderTime,
        notificationEmail: userNotificationSettings.notificationEmail,
      })
      .from(userNotificationSettings)
      .innerJoin(users, eq(users.id, userNotificationSettings.userId))
      .where(
        and(
          eq(userNotificationSettings.dailyReminder, 'true'),
          eq(userNotificationSettings.reminderTime, currentTime)
        )
      );

    console.log(`📧 Found ${recipients.length} users scheduled for daily reminders at ${currentTime}`);

    for (const recipient of recipients) {
      const emailAddress = recipient.notificationEmail || recipient.email;
      
      if (!emailAddress) {
        console.log(`⚠️ Skipping ${recipient.name} - no email address available`);
        continue;
      }

      const textContent = DAILY_REMINDER_TEMPLATE.getTextContent(recipient.name);
      const htmlContent = DAILY_REMINDER_TEMPLATE.getHtmlContent(recipient.name);

      const result = await sendEmailViaBrevо(
        emailAddress,
        DAILY_REMINDER_TEMPLATE.subject,
        textContent,
        htmlContent
      );

      if (result.success) {
        console.log(`✅ Daily reminder sent to ${recipient.name} (${emailAddress})`);
      } else {
        console.error(`❌ Failed to send daily reminder to ${recipient.name}:`, result.error);
      }
    }
  } catch (error) {
    console.error('❌ Error in sendDailyReminders:', error);
  }
}

// Send weekly progress reports
async function sendWeeklyProgressReports() {
  try {
    console.log('📊 Checking for weekly progress report recipients...');
    
    // Find users who want weekly progress reports
    const recipients = await db
      .select({
        userId: users.id,
        email: users.email,
        name: users.name,
        notificationEmail: userNotificationSettings.notificationEmail,
        familyId: users.familyId,
      })
      .from(userNotificationSettings)
      .innerJoin(users, eq(users.id, userNotificationSettings.userId))
      .where(eq(userNotificationSettings.weeklyProgress, 'true'));

    console.log(`📈 Found ${recipients.length} users scheduled for weekly progress reports`);

    for (const recipient of recipients) {
      const emailAddress = recipient.notificationEmail || recipient.email;
      
      if (!emailAddress) {
        console.log(`⚠️ Skipping ${recipient.name} - no email address available`);
        continue;
      }

      // Get user stats for the week
      const stats = await getUserStats(recipient.familyId || recipient.userId);

      const textContent = WEEKLY_PROGRESS_TEMPLATE.getTextContent(recipient.name, stats);
      const htmlContent = WEEKLY_PROGRESS_TEMPLATE.getHtmlContent(recipient.name, stats);

      const result = await sendEmailViaBrevо(
        emailAddress,
        WEEKLY_PROGRESS_TEMPLATE.subject,
        textContent,
        htmlContent
      );

      if (result.success) {
        console.log(`✅ Weekly progress report sent to ${recipient.name} (${emailAddress})`);
      } else {
        console.error(`❌ Failed to send weekly progress to ${recipient.name}:`, result.error);
      }
    }
  } catch (error) {
    console.error('❌ Error in sendWeeklyProgressReports:', error);
  }
}

// Initialize the scheduler
export function startNotificationScheduler() {
  console.log('🚀 Starting ParentJourney notification scheduler...');
  
  // Run daily reminders every minute to check for scheduled times
  cron.schedule('* * * * *', sendDailyReminders, {
    timezone: "America/New_York" // You can make this configurable
  });
  
  // Run weekly progress reports every Sunday at 9:00 AM
  cron.schedule('0 9 * * 0', sendWeeklyProgressReports, {
    timezone: "America/New_York"
  });
  
  console.log('✅ Notification scheduler started successfully');
  console.log('📅 Daily reminders: Checking every minute for scheduled times');
  console.log('📅 Weekly progress: Every Sunday at 9:00 AM EST');
}

// Stop the scheduler (useful for graceful shutdown)
export function stopNotificationScheduler() {
  cron.getTasks().forEach(task => task.stop());
  console.log('🛑 Notification scheduler stopped');
}