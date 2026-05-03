import { jwtVerify } from "jose";

const key = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);

export async function getSession(request) {
  const session = request.cookies.get("accessToken")?.value;
  // console.log(session);
  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });
    // console.log(payload);
    return payload;
  } catch (error) {
    // console.error('JWT verification failed:', error);
    return null;
  }
}
