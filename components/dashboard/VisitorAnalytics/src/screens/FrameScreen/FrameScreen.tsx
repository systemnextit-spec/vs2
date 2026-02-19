import { JSX } from "react";
import { TrafficChartSection } from "./sections/TrafficChartSection";
import { VisitorStatsSection } from "./sections/VisitorStatsSection";

export const FrameScreen = (): JSX.Element => {
  return (
    <div
      className="inline-flex items-center gap-5 relative"
      data-model-id="1134:5496"
    >
      <VisitorStatsSection />
      <TrafficChartSection />
    </div>
  );
};
