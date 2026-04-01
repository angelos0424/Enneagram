# V3 Discriminator Pair Reference Review

## 결론

`v3`의 6개 discriminator pair family는 현재 유지해도 된다.

- RHETI가 paired forced-choice 형식의 문항 묶음을 쓰는 점과 방향성이 맞다.
- 이슈에 언급된 `4-5`와 `6-9` 예시는 둘 다 공신력 있는 misidentification 자료와 합치된다.
- 따라서 이번 검토에서는 페어 family 교체보다, 근거를 코드와 테스트에 남겨 재검토 가능하게 만드는 쪽이 맞다.

## 참고 기준

- RHETI 소개: https://www.enneagraminstitute.com/rheti/
- 1 vs 6: https://www.enneagraminstitute.com/misidentifying-1-and-6/
- 2 vs 9: https://www.enneagraminstitute.com/misidentifying-2-and-9
- 3 vs 8: https://www.enneagraminstitute.com/misidentifying-3-and-8/
- 4 vs 5: https://www.enneagraminstitute.com/misidentifying-4-and-5/
- 6 vs 9: https://www.enneagraminstitute.com/misidentifying-6-and-9/
- 7 vs 8: https://www.enneagraminstitute.com/misidentifying-7-and-8/

## 이슈 예시 확인

### 4 vs 5

- `나는 분위기보다 내 안의 미묘한 감정 변화를 먼저 느낀다.`
- `나는 사람보다 정보와 구조를 먼저 파악하려는 편이다.`

이 조합은 `q3_011`의 attention discriminator다. Enneagram Institute의 4-5 비교는 4번이 주관적 감정과 정체성에 더 몰입하고, 5번은 이해와 추상적 파악 쪽으로 물러난다고 설명한다. 현재 문항은 그 축을 비교적 직접적으로 반영한다.

### 6 vs 9

- `나는 불확실할수록 검증된 기준과 지지가 필요하다고 느낀다.`
- `나는 강한 긴장보다 평온하고 무리 없는 상태를 더 원한다.`

이 조합은 `q3_013`의 motivation discriminator다. Enneagram Institute의 6-9 비교는 6번을 불안, 점검, 테스트, 검증 욕구 쪽으로, 9번을 평온 유지와 갈등 회피 쪽으로 구분한다. 현재 문항은 그 차이를 무난하게 반영한다.

## 주의점

- 현재 문항은 RHETI 문항을 재현한 것이 아니라, 공개 설명을 바탕으로 자체 구성한 forced-choice 세트다.
- 따라서 제품 설명이나 운영 문구에서는 `RHETI와 동일한 검사`처럼 읽히는 표현은 피하는 것이 맞다.
