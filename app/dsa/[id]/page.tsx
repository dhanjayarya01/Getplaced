import { Navbar } from "@/components/navbar"
import { DSAProblemView } from "@/components/dsa/dsa-problem-view"

export default async function DSAProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <DSAProblemView problemId={id} />
      </div>
    </main>
  )
}
