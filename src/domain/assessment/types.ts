export type EnneagramType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type LikertValue = 1 | 2 | 3 | 4 | 5;

export type LikertOption = {
  readonly value: LikertValue;
  readonly label: string;
};

export type AssessmentQuestion = {
  readonly id: string;
  readonly prompt: string;
  readonly typeWeights: Record<
    EnneagramType,
    readonly [number, number, number, number, number]
  >;
};

export type AssessmentDefinition = {
  readonly version: string;
  readonly locale: "ko-KR";
  readonly scoringVersion: string;
  readonly copyVersion: string;
  readonly likertOptions: readonly LikertOption[];
  readonly questions: readonly AssessmentQuestion[];
};

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
