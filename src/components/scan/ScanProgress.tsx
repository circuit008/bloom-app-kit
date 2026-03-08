import { cn } from "@/lib/utils";

interface ScanProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
}

const steps = [
  { label: "IP Check", step: 1 },
  { label: "Accessibility", step: 2 },
  { label: "Quality", step: 3 },
  { label: "Transparency", step: 4 },
];

export function ScanProgress({ currentStep, totalSteps, stepLabel }: ScanProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          Step {currentStep} of {totalSteps}: {stepLabel}
        </span>
        <span className="text-muted-foreground">{Math.round(progress)}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex gap-1">
        {steps.map((s) => (
          <div
            key={s.step}
            className={cn(
              "flex-1 text-center text-xs py-1 rounded",
              s.step < currentStep && "bg-success/10 text-success font-medium",
              s.step === currentStep && "bg-primary/10 text-primary font-medium",
              s.step > currentStep && "bg-muted text-muted-foreground"
            )}
          >
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}
