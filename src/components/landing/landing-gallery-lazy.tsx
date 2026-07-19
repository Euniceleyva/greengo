"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/misc";

export const LandingGalleryLazy = dynamic(
  () => import("@/components/landing/landing-gallery").then((m) => m.LandingGallery),
  { ssr: false, loading: () => <Skeleton className="mx-auto my-16 h-[400px] max-w-6xl rounded-2xl" /> },
);
