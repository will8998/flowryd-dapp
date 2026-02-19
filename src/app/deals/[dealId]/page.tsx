import DealRoom from '@/components/deal-room/DealRoom';

interface DealPageProps {
  params: Promise<{
    dealId: string;
  }>;
}

export default async function DealPage({ params }: DealPageProps) {
  const { dealId } = await params;
  return <DealRoom dealId={dealId} />;
}