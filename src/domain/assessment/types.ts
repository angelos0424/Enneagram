export type EnneagramType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type LikertValue = 1 | 2 | 3 | 4 | 5;
export type ForcedChoiceSide = "left" | "right";
export type AssessmentDimension =
  | "motivation"
  | "attention"
  | "defense"
  | "interpersonal";
export type AssessmentPairCategory = "baseline" | "discriminator";
export type AssessmentResultStatus =
  | "clear"
  | "mixed"
  | "insufficient_variance";
export type AssessmentResponseStyle = "likert" | "forced-choice";

export type LikertOption = {
  readonly value: LikertValue;
  readonly label: string;
};

export type WeightedAssessmentQuestion = {
  readonly id: string;
  readonly prompt: string;
  readonly typeWeights: Record<
    EnneagramType,
    readonly [number, number, number, number, number]
  >;
};

export type KeyedAssessmentQuestion = {
  readonly id: string;
  readonly prompt: string;
  readonly keyedType: EnneagramType;
  readonly reverse: boolean;
  readonly dimension: AssessmentDimension;
};

export type ForcedChoiceAssessmentStatement = {
  readonly prompt: string;
  readonly keyedType: EnneagramType;
  readonly dimension: AssessmentDimension;
};

export type ForcedChoiceAssessmentQuestion = {
  readonly id: string;
  readonly left: ForcedChoiceAssessmentStatement;
  readonly right: ForcedChoiceAssessmentStatement;
  readonly pairCategory: AssessmentPairCategory;
};

export type AssessmentQuestion =
  | WeightedAssessmentQuestion
  | KeyedAssessmentQuestion
  | ForcedChoiceAssessmentQuestion;

export type AssessmentDefinition<
  TQuestion extends AssessmentQuestion = AssessmentQuestion,
> = {
  readonly version: string;
  readonly locale: "ko-KR";
  readonly scoringVersion: string;
  readonly copyVersion: string;
  readonly responseStyle: AssessmentResponseStyle;
  readonly likertOptions: readonly LikertOption[];
  readonly questions: readonly TQuestion[];
};

export type LikertAssessmentAnswer = {
  readonly questionId: string;
  readonly value: LikertValue;
};

export type ForcedChoiceAssessmentAnswer = {
  readonly questionId: string;
  readonly selectedSide: ForcedChoiceSide;
};

export type AssessmentAnswer =
  | LikertAssessmentAnswer
  | ForcedChoiceAssessmentAnswer;

export type NearbyTypeScore = {
  readonly typeId: EnneagramType;
  readonly rawScore: number;
  readonly normalizedScore: number;
  readonly gapFromPrimary: number;
};

export type TypeCopyDetailCard = {
  readonly title: string;
  readonly body: string;
};

export type TypeCopyDisclaimer = {
  readonly title: string;
  readonly body: string;
};

export type TypeCopyRecommendation = {
  readonly title: string;
  readonly description: string;
  readonly href: string;
};

export type TypeCopyEntry = {
  readonly typeId: EnneagramType;
  readonly title: string;
  readonly summary: string;
  readonly disclaimerTone: "interpretive";
  readonly detailCards: readonly TypeCopyDetailCard[];
  readonly disclaimer: TypeCopyDisclaimer;
  readonly recommendations: readonly TypeCopyRecommendation[];
};
