import { Navbar } from "@/components/navbar"
import { CodeArenaWorkspace } from "@/components/code-arena/code-arena-workspace"

export default async function CodeArenaProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <CodeArenaWorkspace problemId={id} />
      </div>
    </main>
  )
}
