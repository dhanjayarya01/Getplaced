import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CompanyDetail } from "@/components/getplaced/company-detail"

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <CompanyDetail companyId={id} />
      </div>
      <Footer />
    </main>
  )
}
