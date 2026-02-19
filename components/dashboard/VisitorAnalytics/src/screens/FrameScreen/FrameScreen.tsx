import { JSX } from "react";
import { TrafficChartSection } from "./sections/TrafficChartSection";
import { VisitorStatsSection } from "./sections/VisitorStatsSection";

export const FrameScreen = (): JSX.Element => {
  return (
    <div>
      <VisitorStatsSection />
      <TrafficChartSection />
    </div>
  );
};
