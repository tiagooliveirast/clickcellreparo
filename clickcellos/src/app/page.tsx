import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function Home() {
  const session = await auth()

  if (session?.user) {
    const role = session.user.role?.toLowerCase() || "dashboard"
    redirect(`/${role}`)
  }

  redirect("/login")
}
