import { PurchaseFundingReview } from '@/components/account/PurchaseFundingReview';
export default async function Page({params}: {params: Promise<{purchase: string}>}) {
  const {purchase} = await params;
  return <PurchaseFundingReview key={purchase} purchaseId={Number(purchase)} />;
}
