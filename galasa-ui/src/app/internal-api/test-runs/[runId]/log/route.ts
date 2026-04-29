/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { fetchRunDetailLogs } from '@/utils/testRuns';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const logStream = await fetchRunDetailLogs(runId);

    // Stream the response body directly to the client without buffering
    return new Response(logStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Error streaming run log:', error);
    return NextResponse.json({ error: 'Failed to stream run log' }, { status: 500 });
  }
}
