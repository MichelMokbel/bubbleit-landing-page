'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {prepareWalletPurchase} from '@/lib/api/client';
import type {PurchaseSubject} from '@/lib/api/funding-types';
import {useI18n} from '@/lib/i18n';
import {AppToast} from '@/components/AppToast';
export function WalletPaymentButton({subjectType, subjectId, reviewPath}: {subjectType: PurchaseSubject; subjectId: number; reviewPath?:string|null}) {
  const {t} = useI18n();
  const router = useRouter();
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState(false);
  async function prepare() {
    if (busy) return;
    if (reviewPath && /^\/account\/payments\/[1-9][0-9]*$/.test(reviewPath)) {router.push(reviewPath);return;}
    setBusy(true); setError(false);
    try { const review = await prepareWalletPurchase(subjectType,subjectId); router.push(review.review_path); }
    catch { setError(true); setBusy(false); }
  }
  return <><button type="button" disabled={busy} onClick={prepare} className="secondary-button min-h-11 px-4">{t(busy ? 'Checking payment…' : 'Use wallet credit')}</button>{error && <AppToast message={t('Payment review is unavailable. Refresh and try again.')} dismissLabel={t("Dismiss")} onDismiss={()=>setError(false)} />}</>;
}
