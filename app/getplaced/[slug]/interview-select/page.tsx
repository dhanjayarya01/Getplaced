import { CompanyInterviewSelectPage } from '@/components/getplaced/company-interview-select'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function InterviewSelectPage({ params }: PageProps) {
  const { slug } = await params

  return <CompanyInterviewSelectPage companyId={slug} />
}
