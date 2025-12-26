import { CompanyDetail } from '@/components/getplaced/company-detail'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const { slug } = await params

  // CompanyDetail expects companyId, which can be slug or ID
  return <CompanyDetail companyId={slug} />
}
