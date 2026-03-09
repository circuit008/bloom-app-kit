import { AlertTriangle, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DMCA = () => {
  return (
    <div className="container max-w-3xl py-12 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-7 w-7 text-primary" />
          <h1 className="font-display text-3xl font-bold">DMCA Takedown Policy</h1>
        </div>
        <p className="text-muted-foreground">Copyright infringement reporting procedure</p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          POD Guard respects intellectual property rights. If you believe your copyrighted work has been used without authorization, follow the procedure below.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none pt-6 space-y-6">
          <section>
            <h2 className="text-lg font-semibold">Filing a DMCA Takedown Notice</h2>
            <p className="text-muted-foreground leading-relaxed">
              To file a valid DMCA takedown notice, please provide the following information in writing:
            </p>
            <ol className="list-decimal pl-6 text-muted-foreground space-y-2 text-sm">
              <li>
                <strong>Identification of the copyrighted work</strong> — Describe or provide a link to the original work you claim has been infringed.
              </li>
              <li>
                <strong>Identification of the infringing material</strong> — Provide the URL or specific location on our platform where the infringing content appears.
              </li>
              <li>
                <strong>Your contact information</strong> — Full name, email address, phone number, and mailing address.
              </li>
              <li>
                <strong>Good faith statement</strong> — A statement that you have a good faith belief that the use is not authorized by the copyright owner, its agent, or the law.
              </li>
              <li>
                <strong>Accuracy statement</strong> — A statement, under penalty of perjury, that the information in the notice is accurate and that you are the copyright owner or authorized to act on their behalf.
              </li>
              <li>
                <strong>Your signature</strong> — Physical or electronic signature of the copyright owner or authorized representative.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Where to Send Notices</h2>
            <div className="flex items-center gap-2 p-4 rounded-lg bg-muted">
              <Mail className="h-5 w-5 text-primary shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-foreground">DMCA Agent</p>
                <p className="text-muted-foreground">dmca@podguard.app</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Response Timeline</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1 text-sm">
              <li>We will acknowledge receipt of your notice within <strong>2 business days</strong>.</li>
              <li>Infringing content will be removed or disabled within <strong>5 business days</strong> of a valid notice.</li>
              <li>The alleged infringer will be notified and given an opportunity to file a counter-notice.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Counter-Notification</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you believe your content was wrongfully removed, you may submit a counter-notification containing your contact information, identification of the removed material, a statement under penalty of perjury that the removal was a mistake, and consent to jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Repeat Infringers</h2>
            <p className="text-muted-foreground leading-relaxed">
              POD Guard will terminate accounts of users who are repeat copyright infringers, in accordance with the DMCA and our Terms & Conditions.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default DMCA;
