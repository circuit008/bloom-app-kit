import { Shield, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="container max-w-3xl py-12 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="h-7 w-7 text-primary" />
          <h1 className="font-display text-3xl font-bold">Terms & Conditions</h1>
        </div>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <Card>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none pt-6 space-y-6">
          <section>
            <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using POD Guard ("the Service"), you agree to be bound by these Terms & Conditions. If you do not agree, please discontinue use immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">2. Intellectual Property Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content on this platform — including designs, images, logos, text, software, and the underlying code — is the intellectual property of POD Guard or its users and is protected by international copyright laws.
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1 text-sm">
              <li>You may <strong>not</strong> copy, reproduce, distribute, or create derivative works from any content without written permission.</li>
              <li>User-uploaded designs remain the property of the uploading user.</li>
              <li>Preview images are watermarked and low-resolution; they may not be used commercially.</li>
              <li>Automated scraping, downloading, or harvesting of images is strictly prohibited.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">3. Prohibited Actions</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1 text-sm">
              <li>Attempting to circumvent image protection measures (watermarks, overlays, download restrictions).</li>
              <li>Using the Service to infringe on third-party intellectual property.</li>
              <li>Reverse engineering, decompiling, or disassembling any part of the Service.</li>
              <li>Uploading malicious files or content that violates applicable laws.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold">4. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining the security of your account and all activity under it. POD Guard reserves the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">5. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              POD Guard provides compliance scanning on a best-effort basis. Results are informational and do not constitute legal advice. We are not liable for any losses arising from reliance on scan results.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">6. Modifications</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to update these terms at any time. Continued use of the Service constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">7. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms are governed by the laws of the Province of Quebec, Canada, without regard to conflict of law provisions.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default Terms;
