import { Metadata } from "next";
import ScenarioQuestionsManager from "@/components/ScenarioQuestionsManager";

export const metadata: Metadata = {
  title: "Scenario Questions | Admin",
};

export default function ScenarioQuestionsPage() {
  return <ScenarioQuestionsManager />;
}
