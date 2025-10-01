
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <ScrollText className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-4xl font-bold text-primary">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-lg leading-relaxed">
          <p className="text-muted-foreground text-center">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          
          <section>
            <h2 className="text-2xl font-semibold text-primary/90 mb-3">Introduction</h2>
            <p>
              Welcome to CPHVA Connect! This privacy policy explains how we collect, use, and protect your personal information when you use our application.
            </p>
            <p className="mt-2 font-semibold text-destructive bg-destructive/10 p-3 rounded-md">
              Please note: This is a placeholder privacy policy. The conference organizers (CPHVA Connect) are responsible for providing the actual, legally compliant privacy policy content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary/90 mb-3">Information We Collect</h2>
            <p>
              When you use CPHVA Connect, we may collect the following information, which is stored locally in your browser&apos;s storage:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4 mt-2">
              <li><strong>Account Information:</strong> Your name, email address, and a password (for login purposes within this app instance).</li>
              <li><strong>Ticket Information:</strong> Details of tickets you purchase, including ticket type, purchase date, and associated QR codes.</li>
              <li><strong>Profile Preferences:</strong> Settings for whether your name and email are publicly visible to other attendees.</li>
              <li><strong>App Preferences:</strong> Settings such as whether you have dismissed informational banners.</li>
              <li><strong>Data created by Admins:</strong> Information about schedule events, speakers, exhibitors, polls, etc., created by conference administrators.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary/90 mb-3">How We Use Your Information</h2>
            <p>
              The information collected is used solely for the functioning of the CPHVA Connect application, including:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4 mt-2">
              <li>Authenticating you and providing access to your account and tickets.</li>
              <li>Displaying conference information such as schedules, speaker details, and exhibitor lists.</li>
              <li>Facilitating attendee check-in via QR codes.</li>
              <li>Allowing you to participate in polls (if applicable).</li>
              <li>Displaying your public profile information to other attendees if you choose to make it public.</li>
              <li>Improving your user experience within the app.</li>
            </ul>
            <p className="mt-2">
              We do not sell or share your personal information collected through this app with third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary/90 mb-3">Data Storage and Security</h2>
            <p>
              All data you provide or that is generated through your use of this app (such as tickets) is stored in your web browser&apos;s local storage. This means the data resides on your device. While we strive to use acceptable means to protect your information during its use within the app, no method of electronic storage is 100% secure.
            </p>
            <p className="mt-2">
              Data created by administrators (schedules, speaker details, etc.) is also stored in local storage for all users of the application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary/90 mb-3">Your Rights</h2>
            <p>
              Regarding your personal data stored by this application:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4 mt-2">
              <li><strong>Access and Portability:</strong> You can access your profile information and purchased tickets through the app. You can also download a copy of your personal data via the &quot;Download My Data&quot; button on your &quot;Edit Profile&quot; page.</li>
              <li><strong>Correction:</strong> You can update your name, email, password, and public visibility preferences on your &quot;Edit Profile&quot; page.</li>
              <li><strong>Deletion (Right to be Forgotten):</strong> To request the deletion of your account and all associated data from the application&apos;s local storage records, please contact the CPHVA Connect conference administrators. Note that clearing your browser&apos;s local storage for this site will also remove your data from your device.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary/90 mb-3">Third-Party Services</h2>
            <p>
              The application may use QR code generation services (e.g., api.qrserver.com) to display QR codes. These services receive the ticket ID data to generate the image but typically do not store this data long-term. Please refer to their respective privacy policies for more information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary/90 mb-3">Changes to This Privacy Policy</h2>
            <p>
              We may update this placeholder Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary/90 mb-3">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact the CPHVA Connect conference organizers.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
