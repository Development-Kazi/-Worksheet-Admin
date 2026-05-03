import { NextResponse } from "next/server";
import { getSession } from "./component/API/Auth";
import { APITemplate } from "./component/API/Template";
import { cookies } from "next/headers";
import { checkpermission } from "./component/global";

export async function middleware(request) {
  const session = await getSession(request);
  // Cache the response if the session exists
  let cachedResponse = null;
  const response = NextResponse.next();

  if (request.nextUrl.pathname == "/login" && !session) {
    return response;
  }

  if (request.nextUrl.pathname == "/" && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (request.nextUrl.pathname === "/" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (request.nextUrl.pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const lockedPaths = [
    "/dashboard",
    "/funds",
    "/clients",
    "/paymentGateway",
    "/settlement",
    "/instantPayout",
    "/payin",
    "/accountSummary",
    "/dailyReports",
    "/blog",
    "/searchPayout",
    "/searchPayin",
  ];

  // Check if the request is for a protected path and the user is not authenticated
  if (
    lockedPaths.some((path) => request.nextUrl.pathname.startsWith(path)) &&
    !session
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session) {
    if (!cachedResponse) {
      cachedResponse = await APITemplate(
        `admin/check/${session._id}`,
        "GET",
        {},
        {
          Authorization: `${request.cookies.get("accessToken")?.value}`,
        }
      );
    }
  } else {
    cachedResponse = {
      success: false,
      data: {
        active: false,
      },
    };
  }

  if (cachedResponse.success == false || cachedResponse.data.active == false) {
    response.cookies.delete("accessToken", {
      httpOnly: true,
      secure: true,
      path: "/",
    });

    response.cookies.delete("refreshToken", {
      httpOnly: true,
      secure: true,
      path: "/",
    });

    response.cookies.delete("adminSession", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return response;
  }

  response.cookies.set("adminSession", session._id, {
    httpOnly: false,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}
