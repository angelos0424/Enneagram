export async function GET() {
  return Response.json(
    {
      ok: true,
      service: "web",
      checks: {
        process: "up",
      },
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
