import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the message to a backend
    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
        <p className="text-xl text-muted-foreground">
          Have questions? We'd love to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Send us a message
            </CardTitle>
            <CardDescription>
              Fill out the form and we'll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="What's this about?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us more..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full gap-2">
                <Send className="w-4 h-4" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">General Inquiries</p>
                <a href="mailto:hello@pixelpod.com" className="text-primary hover:underline">
                  hello@pixelpod.com
                </a>
              </div>
              <div>
                <p className="text-sm font-medium">Technical Support</p>
                <a href="mailto:support@pixelpod.com" className="text-primary hover:underline">
                  support@pixelpod.com
                </a>
              </div>
              <div>
                <p className="text-sm font-medium">Business Partnerships</p>
                <a href="mailto:partners@pixelpod.com" className="text-primary hover:underline">
                  partners@pixelpod.com
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle>FAQ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-sm">How do I get started?</p>
                <p className="text-sm text-muted-foreground">
                  Simply sign up and start creating designs in our Design Studio!
                </p>
              </div>
              <div>
                <p className="font-medium text-sm">Is there a free trial?</p>
                <p className="text-sm text-muted-foreground">
                  Yes! Many of our AI tools are free to use.
                </p>
              </div>
              <div>
                <p className="font-medium text-sm">Can I cancel anytime?</p>
                <p className="text-sm text-muted-foreground">
                  Absolutely. No long-term commitments required.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We typically respond within 24 hours during business days. For urgent matters, 
                please mark your email as urgent or contact us through multiple channels.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
