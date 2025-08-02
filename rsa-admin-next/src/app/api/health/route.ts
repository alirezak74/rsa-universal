// RSA DEX Admin Panel Health Check - Robust Version
export async function GET() {
  try {
    return Response.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'RSA DEX Admin Panel',
      version: '1.0.0',
      port: process.env.PORT || 3001
    });
  } catch (error) {
    console.error('Admin health check error:', error);
    return Response.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}