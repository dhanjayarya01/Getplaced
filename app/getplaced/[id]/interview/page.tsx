import { Navbar } from "@/components/navbar"
import { CompanyInterviewRoom } from "@/components/getplaced/company-interview-room"

export default async function CompanyInterviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ round?: string }>
}) {
  const { id } = await params
  const { round } = await searchParams

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <CompanyInterviewRoom companyId={id} initialRound={round ? Number.parseInt(round) : 0} />
      </div>
    </main>
  )
}
