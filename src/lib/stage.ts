export type TransitionStage = "探索期" | "诊断期" | "规划期" | "执行期" | "求职期";

export interface StageInput {
  hasProfile: boolean;
  skillAssessmentCount: number;
  learningTaskCount: number;
  doneLearningTaskCount: number;
}

export function computeTransitionStage(input: StageInput): TransitionStage {
  if (!input.hasProfile) return "探索期";
  if (input.skillAssessmentCount === 0) return "诊断期";
  if (input.learningTaskCount === 0) return "规划期";
  if (input.learningTaskCount > 0 && input.doneLearningTaskCount / input.learningTaskCount >= 0.5) return "求职期";
  if (input.doneLearningTaskCount > 0) return "执行期";
  return "规划期";
}
