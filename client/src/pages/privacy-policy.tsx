import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header with back button */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="hover-scale mb-4" data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Main
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Privacy Policy & Terms of Use
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Effective Date: August 1, 2025 | Operated by: Kool Arrow Solutions LLC
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              By signing up, you agree to this Privacy Policy and the Terms of Use outlined below.
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                1. Information We Collect
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                We collect the following types of information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>Account Information:</strong> Email, password (hashed), and optional profile data through Google, Facebook, GitHub, or Twitter login.</li>
                <li><strong>Journal Entries & Reflections:</strong> Written content you submit in the app for personal wellness and parenting insights.</li>
                <li><strong>Child Profiles:</strong> Information about your children that you provide (e.g., name, age range, personality traits).</li>
                <li><strong>AI Feedback Context:</strong> Mood logs, selected prompts, and recent behavior insights you input for personalized support.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                2. How We Use Your Information
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                We use your data to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Deliver personalized wellness reflections and parenting insights using AI</li>
                <li>Maintain secure authentication and session management</li>
                <li>Provide mood tracking, journaling features, and parenting tools</li>
                <li>Send optional notifications (e.g., reminders or progress reports)</li>
                <li>Improve user experience and support your parenting journey</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                3. Data Sharing & Third-Party Services
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                We do not sell or share your personal information with advertisers. However, we do share limited data with trusted third parties for functionality:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li><strong>OpenAI API:</strong> Journal entries and parenting context are processed via OpenAI's GPT-4o to generate personalized insights. Per OpenAI's policy, API data is not stored long term or used for training.</li>
                <li><strong>Brevo (formerly Sendinblue):</strong> We use Brevo to send optional email reminders and progress reports.</li>
                <li><strong>OAuth Providers:</strong> If you sign in using Google, Facebook, GitHub, or Twitter, we receive only basic profile data (email and name).</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Data Security
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                We take strong precautions to protect your data:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>All data in transit is encrypted using HTTPS</li>
                <li>Passwords are hashed using bcrypt</li>
                <li>Session tokens are securely generated and stored</li>
                <li>Database encryption and backups are managed by our provider, Neon Database</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Your Control Over Your Data
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                You can:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Delete individual journal entries or child profiles</li>
                <li>Revoke access or sign out at any time</li>
                <li>Delete your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Children's Privacy
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                This app is intended only for adult parents and caregivers. We do not knowingly collect information directly from children under 18. Any child-related data is provided by the parent or caregiver and used solely to support parenting goals.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Service Availability
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                We aim to maintain reliable access, but the App may experience occasional downtime due to maintenance, technical issues, or third-party outages. The service is provided "as is" without guarantees of uptime or availability.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Accessibility
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                We are committed to accessibility. If you require accommodations or support, please contact us at info@socialworkmagic.com and we will make reasonable efforts to assist you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Intellectual Property & Content Use
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                All intellectual property within the App is owned by Ernesto Bejarano – Kool Arrow Solutions LLC. No content or code may be reused, modified, or redistributed without express written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                10. Dispute Resolution
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                In the event of a dispute, both parties agree to attempt resolution through good-faith negotiation. If unresolved, the matter will be settled through mediation, and if necessary, binding arbitration under the rules of the American Arbitration Association.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                11. Limitation of Liability
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                This service is provided "as is" with no warranties of any kind. Ernesto Bejarano – Kool Arrow Solutions LLC shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the App. Your sole remedy is to stop using the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                12. Governing Law
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                These terms are governed by the laws of the State of California, United States, without regard to conflict of law principles.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                13. Updates and Modifications
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                We may update this policy and terms of use from time to time. If changes are material, we will notify users by email or through the App.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                14. Contact Us
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                If you have questions about this Privacy Policy or Terms of Use, contact us at:
              </p>
              <div className="mt-3 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
                <p className="font-semibold text-gray-900 dark:text-white">Kool Arrow Solutions LLC</p>
                <p className="text-gray-700 dark:text-gray-300">📧 info@socialworkmagic.com</p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Last updated: August 1, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}