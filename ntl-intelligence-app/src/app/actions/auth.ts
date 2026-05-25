"use server"

import { cookies } from "next/headers"

export async function setAuthCookies(token: string, role: string) {
  cookies().set("__session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7 // 1 week
  })
  
  cookies().set("ntl_role", role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  })
}

export async function clearAuthCookies() {
  cookies().delete("__session")
  cookies().delete("ntl_role")
}
