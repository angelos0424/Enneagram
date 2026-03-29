import React from "react";

import type {
  EnneagramType,
  TypeCopyDetailCard,
  TypeCopyDisclaimer,
  TypeCopyEntry,
  TypeCopyRecommendation,
} from "@/domain/assessment/types";

type NearbyTypeView = {
  typeId: EnneagramType;
  rawScore: number;
  normalizedScore: number;
  gapFromPrimary: number;
};

export type ResultSnapshotViewModel = {
  publicId: string;
  primaryType: EnneagramType;
  wingType: EnneagramType;
  growthType: EnneagramType;
  stressType: EnneagramType;
  normalizedScores: Record<EnneagramType, number>;
  nearbyTypes: NearbyTypeView[];
  copy: TypeCopyEntry;
  wingCopy: TypeCopyEntry;
  growthCopy: TypeCopyEntry;
  stressCopy: TypeCopyEntry;
  detailCards: readonly TypeCopyDetailCard[];
  disclaimer: TypeCopyDisclaimer;
  recommendations: readonly TypeCopyRecommendation[];
};

const enneagramTypes = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const satisfies readonly EnneagramType[];

export function ResultSnapshotView({
  snapshot,
}: {
  snapshot: ResultSnapshotViewModel;
}) {
  return (
    <main>
      <header>
        <p>공개 결과</p>
        <h1>{snapshot.copy.title}</h1>
        <p>{snapshot.copy.summary}</p>
      </header>

      <section aria-labelledby="result-summary-heading">
        <h2 id="result-summary-heading">상세 결과 요약</h2>
        <dl>
          <div>
            <dt>주 유형</dt>
            <dd>{snapshot.primaryType}</dd>
          </div>
          <div>
            <dt>날개</dt>
            <dd>{snapshot.wingType}</dd>
            <p>{snapshot.wingCopy.title}</p>
          </div>
          <div>
            <dt>성장 방향</dt>
            <dd>{snapshot.growthType}</dd>
            <p>{snapshot.growthCopy.title}</p>
          </div>
          <div>
            <dt>스트레스 방향</dt>
            <dd>{snapshot.stressType}</dd>
            <p>{snapshot.stressCopy.title}</p>
          </div>
        </dl>
      </section>

      <section aria-labelledby="distribution-heading">
        <h2 id="distribution-heading">정규화 점수 분포</h2>
        <ul>
          {enneagramTypes.map((typeId) => (
            <li key={typeId}>
              <span>{typeId}</span>
              <span>{snapshot.normalizedScores[typeId]}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="nearby-heading">
        <h2 id="nearby-heading">근접 유형</h2>
        <ul>
          {snapshot.nearbyTypes.map((type) => (
            <li key={type.typeId}>
              <span>{type.typeId}</span>
              <span>{type.normalizedScore}</span>
              <span>{type.gapFromPrimary}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="detail-cards-heading">
        <h2 id="detail-cards-heading">해석 카드</h2>
        <ul>
          {snapshot.detailCards.map((card) => (
            <li key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="disclaimer-heading">
        <h2 id="disclaimer-heading">{snapshot.disclaimer.title}</h2>
        <p>{snapshot.disclaimer.body}</p>
      </section>

      <section aria-labelledby="recommendation-heading">
        <h2 id="recommendation-heading">다음 행동 제안</h2>
        <ul>
          {snapshot.recommendations.map((recommendation) => (
            <li key={recommendation.title}>
              <span>{recommendation.title}</span>
              <p>{recommendation.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <footer>
        <p>{snapshot.publicId}</p>
      </footer>
    </main>
  );
}
