import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Sparkles, Zap, Users } from "lucide-react";

const About = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">About PixelPOD</h1>
        <p className="text-xl text-muted-foreground">
          Your AI-powered print-on-demand design studio
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            PixelPOD is revolutionizing the print-on-demand industry by combining cutting-edge AI technology 
            with intuitive design tools. We empower creators, entrepreneurs, and businesses to bring their 
            creative visions to life effortlessly.
          </p>
          <p className="text-muted-foreground">
            Our platform eliminates the technical barriers of design, allowing you to focus on what matters 
            most—your creativity and business growth.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Palette className="w-8 h-8 mb-2 text-primary" />
            <CardTitle>Design Studio</CardTitle>
            <CardDescription>
              Professional design tools powered by AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create stunning t-shirt designs with our intuitive canvas editor and AI-powered design generation.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Sparkles className="w-8 h-8 mb-2 text-primary" />
            <CardTitle>AI Tools</CardTitle>
            <CardDescription>
              Advanced image processing and enhancement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Remove backgrounds, enhance images, and generate SEO-optimized content with our AI-powered tools.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Zap className="w-8 h-8 mb-2 text-primary" />
            <CardTitle>Seamless Integration</CardTitle>
            <CardDescription>
              Connect directly to your Shopify store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Upload your designs directly to Shopify with just one click. No manual work required.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Users className="w-8 h-8 mb-2 text-primary" />
            <CardTitle>Built for Creators</CardTitle>
            <CardDescription>
              By creators, for creators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We understand the challenges of running a print-on-demand business and built PixelPOD to solve them.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardHeader>
          <CardTitle>Why Choose PixelPOD?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            <p className="text-muted-foreground">
              <strong className="text-foreground">Free AI Tools:</strong> Access powerful AI features without expensive subscriptions
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            <p className="text-muted-foreground">
              <strong className="text-foreground">No Design Experience Needed:</strong> Create professional designs with intuitive tools
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            <p className="text-muted-foreground">
              <strong className="text-foreground">Direct Shopify Integration:</strong> Streamline your workflow from design to sale
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            <p className="text-muted-foreground">
              <strong className="text-foreground">Save & Organize:</strong> Build your design library and reuse your best work
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;
