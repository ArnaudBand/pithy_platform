import { Metadata } from "next";
import ScenarioAssessmentTaker from "@/components/ScenarioAssessmentTaker";
import { checkScenarioAccess } from "@/lib/actions/scenario-assessment.actions";

export const metadata: Metadata = {
  title: "Scenario Assessment | Pithy Means",
  description:
    "Unlock scenario-based personality evaluation to gain deeper self-insight.",
};

/**
 * Scenario Assessment page — requires a one-time payment of 5,000 UGX.
 * Checks the dedicated scenario_assessment_access table; no course enrollment needed.
 */
export default async function ScenarioAssessmentPage() {
  const { hasPaid, remainingAttempts } = await checkScenarioAccess();

  return (
    <div className="min-h-screen bg-slate-50">
      <ScenarioAssessmentTaker hasPaid={hasPaid} remainingAttempts={remainingAttempts} />
    </div>
  );
}
