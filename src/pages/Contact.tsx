import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";

const faqs = [
  { q: "How do I get started?", a: "Simply sign up and start creating designs in our Design Studio!" },
  { q: "Is there a free trial?", a: "Yes! Many of our AI tools are free to use." },
  { q: "Can I cancel anytime?", a: "Absolutely. No long-term commitments required." },
];

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader icon={Mail} title="Contact Us" description="Have questions? We'd love to hear from you." />

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <MessageSquare className="w-4 h-4" /> Send a message
            </CardTitle>
            <CardDescription>Fill out the form and we'll get back to you.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-email">Email</Label>
                <Input id="c-email" type="email" placeholder="your@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="What's this about?" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Tell us more..." rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required />
              </div>
              <Button type="submit" className="w-full gap-2">
                <Send className="w-4 h-4" /> Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-lg">
                <Mail className="w-4 h-4" /> Email Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "General Inquiries", email: "hello@pixelpod.com" },
                { label: "Technical Support", email: "support@pixelpod.com" },
                { label: "Business Partnerships", email: "partners@pixelpod.com" },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                  <a href={`mailto:${item.email}`} className="text-sm text-primary hover:underline">{item.email}</a>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="font-display text-lg">FAQ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {faqs.map((f, i) => (
                <div key={i}>
                  <p className="text-sm font-medium">{f.q}</p>
                  <p className="text-xs text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">We typically respond within 24 hours during business days.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
