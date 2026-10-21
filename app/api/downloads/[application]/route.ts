import { downloadHandlers } from "../../../../server/download-http.mjs";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(
  request: Request,
  context: { params: Promise<{ application: string }> },
) {
  return downloadHandlers.POST(request, (await context.params).application);
}
