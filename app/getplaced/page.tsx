import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { GetPlacedHero } from "@/components/getplaced/getplaced-hero"
import { CompanySearch } from "@/components/getplaced/company-search"
import { CompanyList } from "@/components/getplaced/company-list"
import { ResumeSection } from "@/components/getplaced/resume-section"

export default function GetPlacedPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        <GetPlacedHero />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <CompanySearch />
          <div className="grid lg:grid-cols-3 gap-8 mt-12">
            <div className="lg:col-span-2">
              <CompanyList />
            </div>
            <aside>
              <ResumeSection />
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
