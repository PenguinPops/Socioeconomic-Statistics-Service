import { SessionProvider } from "next-auth/react"
import Home from "@/app/home/page"
import RootLayout from "./layout"

 
export default function RootPage() {
  return (
    <Home />
  )
}