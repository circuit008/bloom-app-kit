import { Check, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";
import type { TranslationKey } from "@/i18n/translations";

export default function Pricing() {
  const { user } = useAuth();
  const { profile, isPro, upgrade } = useProfile();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const plans = [
    {
      name: t("free"),
      price: "$0",
      period: t("forever"),
      description: t("freeDesc"),
      features: [
        t("feat5Scans"), t("featBasicIP"), t("featQualityVal"), t("featAccessAudit"), t("featEmailSupport"),
      ],
      cta: t("getStarted"),
      highlighted: false,
      tier: "free",
    },
    {
      name: t("pro"),
      price: "$9.99",
      period: t("perMonth"),
      description: t("proDesc"),
      features: [
        t("featUnlimitedScans"), t("featFull4Step"), t("featPDFReports"), t("featPrioritySupport"),
        t("featScanHistory"), t("featSupplyChain"), t("featAffiliateTracking"),
      ],
      cta: t("upgradeToPro"),
      highlighted: true,
      tier: "pro",
    },
    {
      name: t("business"),
      price: "$49",
      period: t("perMonth"),
      description: t("businessDesc"),
      features: [
        t("featEverythingPro"), t("featTeamCollab"), t("featBulkScan"), t("featCustomRules"),
        t("featDedicatedManager"), t("featSSO"), t("featAPI"),
      ],
      cta: t("contactSales"),
      highlighted: false,
      tier: "business",
    },
  ];

  const handleCta = async (tier: string) => {
    if (!user) { navigate("/"); toast.info("Please sign in first."); return; }
    if (tier === "free") { navigate("/dashboard"); }
    else if (tier === "pro") {
      if (isPro) { toast.info("You're already on the Pro plan!"); return; }
      await upgrade();
      toast.success("🎉 Upgraded to Pro!");
      navigate("/dashboard");
    } else {
      toast.info("Business plans are coming soon.");
    }
  };

  return (
    <div className="container py-16 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold">{t("pricingTitle")}</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">{t("pricingSubtitle")}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const isCurrent = profile?.subscription_status === plan.tier;
          return (
            <Card key={plan.tier} className={cn("relative flex flex-col", plan.highlighted && "border-primary shadow-lg ring-1 ring-primary/20")}>
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Zap className="h-3 w-3" /> {t("mostPopular")}
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  {plan.name}
                  {isCurrent && <Badge variant="outline" className="text-xs">{t("currentPlan")}</Badge>}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-3">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1 text-sm">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.highlighted ? "default" : "outline"} disabled={isCurrent} onClick={() => handleCta(plan.tier)}>
                  {isCurrent ? t("currentPlan") : plan.cta}
                  {!isCurrent && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground space-y-1">
        <p>{t("moneyBack")}</p>
        <p>
          <a href="/privacy" className="underline">{t("privacyPolicy")}</a> · <a href="/terms" className="underline">{t("termsOfService")}</a>
        </p>
      </div>
    </div>
  );
}
