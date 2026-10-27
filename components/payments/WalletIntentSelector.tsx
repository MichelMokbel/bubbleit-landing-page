'use client';
import {useI18n} from '@/lib/i18n';
export function WalletIntentSelector({available,checked,onChange}: {available?: boolean;checked:boolean;onChange:(value:boolean)=>void}) {
  const {t} = useI18n();
  if (!available) return null;
  return <label className="my-4 flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4"><input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={checked} onChange={e=>onChange(e.target.checked)} /><span><span className="block font-semibold">{t('Use wallet credit')}</span><span className="mt-1 block text-sm">{t('Review your wallet amount and pay any remainder on the next page.')}</span></span></label>;
}
