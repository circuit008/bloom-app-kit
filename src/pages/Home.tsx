import { Shield, Search, Eye, CheckCircle, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";
import { useLanguage } from "@/hooks/useLanguage";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [authOpen, setAuthOpen] = useState(false);

  const features = [
    {
      icon: Search,
      title: t("featureIPTitle"),
      description: t("featureIPDesc"),
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Eye,
      title: t("featureAccessTitle"),
      description: t("featureAccessDesc"),
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      icon: CheckCircle,
      title: t("featureQualityTitle"),
      description: t("featureQualityDesc"),
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      icon: FileText,
      title: t("featureTransTitle"),
      description: t("featureTransDesc"),
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
  ];

  const handleCTA = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      setAuthOpen(true);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-success/5" />
        <div className="container relative py-24 md:py-36 flex flex-col items-center text-center gap-6">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground animate-fade-in">
            <Shield className="h-4 w-4 text-primary" />
            {t("heroBadge")}
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.1] animate-slide-up">
            {t("heroTitle")}{" "}
            <span className="text-primary">{t("heroTitleHighlight")}</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl animate-slide-up" style={{ animationDelay: "0.1s" }}>
            {t("heroSubtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Button size="lg" className="text-base px-8 h-12" onClick={handleCTA}>
              {t("startFreeScan")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 h-12" onClick={() => navigate("/about")}>
              {t("learnMore")}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            {t("noCreditCard")}
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            {t("fourPillars")}{" "}
            <span className="text-primary">{t("compliance")}</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            {t("fourPillarsDesc")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <Card
              key={i}
              className="border bg-card hover:shadow-md transition-shadow animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <CardContent className="pt-6 pb-6 space-y-4">
                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-lg ${f.bg}`}>
                  <f.icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA section */}
      <section className="border-t bg-muted/50">
        <div className="container py-16 flex flex-col items-center text-center gap-4">
          <h2 className="text-2xl md:text-3xl font-bold">{t("readyToProtect")}</h2>
          <p className="text-muted-foreground max-w-lg">
            {t("joinSellers")}
          </p>
          <Button size="lg" className="mt-2" onClick={handleCTA}>
            {t("startFreeScan")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">POD Guard</span>
          </div>
          <p>© {new Date().getFullYear()} POD Guard. All rights reserved.</p>
        </div>
      </footer>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
