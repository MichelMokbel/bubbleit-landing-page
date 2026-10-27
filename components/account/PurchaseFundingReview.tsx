'use client';
import {useCallback, useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {ApiError, me, getWalletPurchase, confirmWalletPurchase, cancelWalletPurchase} from '@/lib/api/client';
import {exactWalletMinor, type FundingReview, type FundingChannel} from '@/lib/api/funding-types';
import {usableCheckoutUrl} from '@/lib/booking/payment-flow';
import {Navbar} from '@/components/Navbar';
import {Footer} from '@/components/Footer';
import {AuthPanel} from '@/components/booking/AuthPanel';
import {AppToast} from '@/components/AppToast';
import {formatQar} from '@/lib/money';
import {useI18n} from '@/lib/i18n';

const subjectLabels = {booking:'Booking',membership:'Membership purchase',store_order:'Store order',parking_stay:'Parking charge'};
const channelLabels: Record<FundingChannel,string> = {skipcash_hosted:'Card',skipcash_qpay:'QPay',paylater:'PayLater',cash:'Cash',bank_transfer:'Bank transfer'};
export function PurchaseFundingReview({purchaseId}: {purchaseId: number}) {
  const {lang,t} = useI18n();
  const [review,setReview] = useState<FundingReview|null>(null);
  const [signedIn,setSignedIn] = useState<boolean|null>(null);
  const [error,setError] = useState(false);
  const [busy,setBusy] = useState(false);
  const [amount,setAmount] = useState('');
  const [channel,setChannel] = useState<FundingChannel>('skipcash_hosted');
  const key = useRef<string|null>(null);
  const mutation = useRef(false);
  const requestVersion = useRef(0);
  const load = useCallback(async () => {
    const version = ++requestVersion.current;
    try {
      await me();
      if (version !== requestVersion.current) return;
      setReview(null);
      setSignedIn(true);
      const next = await getWalletPurchase(purchaseId);
      if (version !== requestVersion.current) return;
      setReview(next); setChannel(current=>next.external_channels.includes(current) ? current : next.external_channels[0] ?? 'cash'); setError(false);
    } catch(e) {
      if (version !== requestVersion.current) return;
      if (e instanceof ApiError && e.status === 401) {setSignedIn(false);setReview(null);}
      else setError(true);
    }
  },[purchaseId]);
  useEffect(()=>{
    const versionCounter = requestVersion;
    void Promise.resolve().then(load);
    const focus=()=>{if (!mutation.current) void load();};
    window.addEventListener('focus',focus);
    return ()=>{++versionCounter.current; window.removeEventListener('focus',focus);};
  },[load]);
  const minor = exactWalletMinor(amount);
  const remainder = review && minor !== null ? review.amount_minor-minor : null;
  const held = review?.funding?.status === 'awaiting_remainder';
  const paid = ['paid','partially_refunded','refunded'].includes(review?.status ?? '');
  const paymentNotice = review?.status === 'paid' ? t('Payment confirmed') : t('Refund recorded');
  const valid = review && minor !== null && minor <= review.amount_minor && minor <= review.wallet.available_minor && (remainder === 0 || review.external_channels.includes(channel));
  async function confirm() {
    if (!review || !valid || mutation.current) return;
    mutation.current=true; setBusy(true); setError(false); ++requestVersion.current;
    key.current ??= crypto.randomUUID();
    try {setReview(await confirmWalletPurchase(purchaseId,{wallet_amount:amount,external_channel:remainder === 0 ? null : channel,command_key:key.current}));}
    catch {await load();setError(true);}
    finally {mutation.current=false; setBusy(false);}
  }
  async function cancel() {
    if (!review?.funding || mutation.current) return;
    mutation.current=true; setBusy(true); ++requestVersion.current;
    try {setReview(await cancelWalletPurchase(purchaseId,review.funding.id));key.current=null;setError(false);}
    catch {await load();setError(true);}
    finally {mutation.current=false;setBusy(false);}
  }
  const manualRemainder = ['cash','bank_transfer'].includes(review?.funding?.external_channel ?? '');
  const checkout = usableCheckoutUrl(review?.funding?.checkout_url);
  return <><Navbar/><main className="mx-auto min-h-[70vh] max-w-xl px-4 py-28"><h1 className="text-3xl font-bold">{t('Review wallet payment')}</h1>
    {signedIn === false ? <AuthPanel onAuthed={()=>void load()} /> : <>
      {!review && !error && <p role="status" className="mt-6">{t('Checking payment…')}</p>}
      {review && <section className="commerce-card mt-6 space-y-5 p-5">
        <h2 className="text-xl font-bold">{t(subjectLabels[review.subject_type])}</h2>{review.subject_reference && <p><bdi>{review.subject_reference}</bdi></p>}
        <dl className="space-y-3"><div className="flex flex-wrap justify-between gap-2"><dt>{t('Purchase total')}</dt><dd>{formatQar(review.amount_minor/100,lang)}</dd></div><div className="flex flex-wrap justify-between gap-2"><dt>{t('Available wallet credit')}</dt><dd>{formatQar(review.wallet.available_minor/100,lang)}</dd></div></dl>
        {paid && review.funding?.status === 'completed' && <dl className="space-y-3"><div className="flex flex-wrap justify-between gap-2"><dt>{t('Paid from wallet')}</dt><dd>{formatQar(review.funding.wallet_amount_minor/100,lang)}</dd></div>{review.funding.external_amount_minor > 0 && <div className="flex flex-wrap justify-between gap-2"><dt>{t('Other payment')}</dt><dd>{formatQar(review.funding.external_amount_minor/100,lang)}</dd></div>}</dl>}
        {paid ? <p role="status">{paymentNotice}</p> : held && review.funding ? <>
          <p role="status">{t('Wallet credit is held until the remaining payment is confirmed.')}</p>
          <p>{t('Wallet credit')}: {formatQar(review.funding.wallet_amount_minor/100,lang)}</p><p>{t('Remaining payment')}: {formatQar(review.funding.external_amount_minor/100,lang)}</p>
          {review.funding.remainder_collection_available === false ? <p>{t('This payment hold is no longer available. Refresh or cancel before paying.')}</p> : checkout ? <a href={checkout} onClick={e=>{if (review.funding && Date.parse(review.funding.expires_at) <= Date.now()) {e.preventDefault();void load();}}} className="primary-button min-h-11 px-4">{t('Continue payment')}</a> : <p>{t(manualRemainder ? 'Pay only the remaining amount to our team. Payment completes when receipt is recorded.' : 'Payment is awaiting verification. Refresh before trying again.')}</p>}
          <button type="button" disabled={busy} onClick={cancel} className="secondary-button min-h-11 px-4">{t('Cancel wallet payment')}</button>
        </> : review.status !== 'pending' ? <p role="status">{t('This purchase is closed.')}</p> : review.can_confirm === false && review.wallet.capabilities.can_spend ? <p>{t('Payment under review')}</p> : review.wallet.capabilities.can_spend ? <form onSubmit={e=>{e.preventDefault();void confirm();}} className="space-y-4">
          <label className="block">{t('Wallet amount (QAR)')}<input className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 p-3" inputMode="decimal" value={amount} onChange={e=>{setAmount(e.target.value);key.current=null;}} disabled={busy} required pattern="(?:0|[1-9][0-9]*)(?:\.[0-9]{1,2})?" /></label>
          {remainder !== null && remainder >= 0 && <p>{t('Remaining payment')}: {formatQar(remainder/100,lang)}</p>}
          {remainder !== 0 && <label className="block">{t('Remaining payment method')}<select className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 p-3" value={channel} onChange={e=>{setChannel(e.target.value as FundingChannel);key.current=null;}} disabled={busy}>{review.external_channels.map(c=><option key={c} value={c}>{t(channelLabels[c])}</option>)}</select></label>}
          <p className="text-sm">{t('Confirm the total and wallet amount. Only you can authorize spending your credit.')}</p>
          <button type="submit" disabled={!valid || busy} className="primary-button min-h-11 px-4">{t('Confirm wallet payment')}</button>
        </form> : <p>{t('Wallet spending is currently unavailable.')}</p>}
        <button type="button" disabled={busy} onClick={()=>void load()} className="secondary-button min-h-11 px-4">{t('Refresh payment')}</button>
      </section>}
      {error && <><AppToast message={t('Payment review is unavailable. Refresh and try again.')} dismissLabel={t("Dismiss")} onDismiss={()=>setError(false)}/><button type="button" disabled={busy} onClick={()=>void load()} className="secondary-button mt-4 min-h-11 px-4">{t('Retry')}</button></>}
    </>}
    <Link href="/account" className="mt-6 inline-flex min-h-11 items-center">{t('Back to account')}</Link>
  </main><Footer/></>;
}
