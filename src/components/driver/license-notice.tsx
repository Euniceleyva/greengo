"use client";

import Link from "next/link";
import { AlertTriangle, FileUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLicenseNotice } from "@/lib/driver-compliance";
import { formatDate } from "@/lib/format";
import type { Driver } from "@/types";

export function DriverLicenseNotice({
  driver,
  compact = false,
  action = true,
}: {
  driver: Driver;
  compact?: boolean;
  action?: boolean;
}) {
  const notice = getLicenseNotice(driver.licenseExpiresOn);
  if (!notice) return null;

  return (
    <Card className={notice.tone === "danger" ? "border-destructive/30 bg-destructive-soft" : "border-warning/30 bg-warning-soft"}>
      <CardContent className={compact ? "p-3" : "p-4"}>
        <div className="flex items-start gap-3">
          <span className={notice.tone === "danger" ? "text-destructive" : "text-warning"}>
            <AlertTriangle className={compact ? "h-4 w-4" : "h-5 w-5"} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold">{notice.title}</p>
              <Badge tone={notice.tone}>{formatDate(driver.licenseExpiresOn, "dd MMM yyyy")}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {compact ? `Vence el ${formatDate(driver.licenseExpiresOn, "dd MMM yyyy")}.` : notice.detail}
            </p>
            {action && (
              <Link
                href="/driver/profile"
                className={compact
                  ? "mt-2 inline-flex min-h-[32px] items-center gap-1.5 rounded-md bg-card px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
                  : "mt-3 inline-flex min-h-[36px] items-center gap-2 rounded-md border border-border bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"}
              >
                <FileUp className="h-3.5 w-3.5" /> Actualizar documento
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
