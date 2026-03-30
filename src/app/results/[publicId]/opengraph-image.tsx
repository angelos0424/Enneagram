import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";

import { DrizzleAssessmentResultRepository } from "@/db/repositories/assessment-result-repository";
import { resolveResultCopy } from "@/domain/assessment/result-copy";
import type { EnneagramType } from "@/domain/assessment/types";

export const alt = "에니어그램 결과 미리보기";
export const contentType = "image/png";
export const runtime = "nodejs";
export const size = {
  width: 1200,
  height: 630,
};

type PublicResultOgImageProps = {
  params: Promise<{ publicId: string }>;
};

export default async function OpenGraphImage({
  params,
}: PublicResultOgImageProps) {
  const { publicId } = await params;
  const repository = new DrizzleAssessmentResultRepository();
  const record = await repository.findByPublicId(publicId);

  if (!record) {
    notFound();
  }

  const primaryType = Number(record.primaryType) as EnneagramType;
  const wingType = Number(record.wingType) as EnneagramType;
  const copy = resolveResultCopy(record.copyVersion, primaryType);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background:
            "radial-gradient(circle at top left, rgba(245, 158, 11, 0.22), transparent 32%), linear-gradient(180deg, #fcfbf7 0%, #f2ead9 100%)",
          color: "#1c1917",
          fontFamily: "sans-serif",
          padding: "48px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            borderRadius: "36px",
            border: "1px solid rgba(120, 53, 15, 0.12)",
            background: "rgba(255, 255, 255, 0.94)",
            boxShadow: "0 24px 70px rgba(120, 53, 15, 0.12)",
            padding: "48px",
            justifyContent: "space-between",
            gap: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "24px",
                fontWeight: 700,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "#b45309",
              }}
            >
              공개 결과 미리보기
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "64px",
                  fontWeight: 700,
                  lineHeight: 1.1,
                }}
              >
                {copy.title}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "30px",
                  lineHeight: 1.45,
                  color: "#44403c",
                }}
              >
                {copy.summary}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "16px",
                marginTop: "auto",
              }}
            >
              {[
                { label: "주 유형", value: `${primaryType}` },
                { label: "날개", value: `${wingType}` },
                { label: "근접 유형", value: record.nearbyTypes[0]?.typeId?.toString() ?? "-" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    borderRadius: "24px",
                    border: "1px solid rgba(120, 53, 15, 0.12)",
                    background: "#faf5eb",
                    padding: "18px 22px",
                    minWidth: "150px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: "18px",
                      fontWeight: 600,
                      color: "#78716c",
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: "34px",
                      fontWeight: 700,
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              width: "260px",
              minWidth: "260px",
              borderRadius: "32px",
              background: "linear-gradient(180deg, rgba(245, 158, 11, 0.22), rgba(120, 53, 15, 0.08))",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "inset 0 0 0 1px rgba(120, 53, 15, 0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "26px",
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#92400e",
                }}
              >
                Type
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "132px",
                  fontWeight: 800,
                  lineHeight: 1,
                  color: "#78350f",
                }}
              >
                {primaryType}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
