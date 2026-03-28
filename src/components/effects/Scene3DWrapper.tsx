"use client";

import dynamic from "next/dynamic";

const Scene3D = dynamic(
    () => import("@/components/effects/Scene3D").then((mod) => mod.Scene3D),
    { ssr: false }
);

export function Scene3DWrapper() {
    return <Scene3D />;
}
