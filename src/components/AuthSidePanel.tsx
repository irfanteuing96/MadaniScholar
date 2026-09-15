import { BrandIllustration } from "@/components/BrandIllustration";
import { Logo } from "@/components/Logo";

export function AuthSidePanel({ quote }: { quote: string }) {
  return (
    <div className="bg-dot-grid relative hidden overflow-hidden border-r border-border bg-surface-muted lg:flex lg:w-[42%] lg:flex-col lg:justify-between lg:p-10">
      <div className="decor-blob -left-16 -top-16 h-64 w-64" style={{ background: "#F3DDD0" }} />
      <div className="decor-blob -right-20 bottom-10 h-72 w-72" style={{ background: "#FAF6EE" }} />

      <Logo className="relative h-12" />

      <BrandIllustration className="relative mx-auto h-auto w-full max-w-xs" />

      <p className="relative text-sm text-foreground-muted">{quote}</p>
    </div>
  );
}
