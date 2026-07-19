"use server"

import { signIn } from "@/lib/auth"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    const url = await signIn("credentials", {
      email,
      password,
      redirect: false,
      redirectTo: "/",
    })

    if (url && url.includes("error=")) {
      return { success: false, error: "Email ou senha inválidos" }
    }

    return { success: true }
  } catch (error) {
    console.error("login error", error)
    return { success: false, error: "Erro ao conectar. Tente novamente." }
  }
}
