import { CompanyInterviewRoom } from '@/components/getplaced/company-interview-room'
import { VapiProvider } from '@/components/interviews/vapi-provider'

interface PageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    roleIndex?: string
    round?: string
  }>
}

export default async function CompanyInterviewPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { roleIndex, round } = await searchParams

  const roleIdx = parseInt(roleIndex || '0')
  const roundNum = parseInt(round || '1')

  return (
    <VapiProvider>
      <CompanyInterviewRoom
        companyId={slug}
        roleIndex={roleIdx}
        roundNumber={roundNum}
      />
    </VapiProvider>
  )
}
