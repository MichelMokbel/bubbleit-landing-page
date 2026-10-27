import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const wallet = { currency: 'QAR', balance_minor: 15000, reserved_minor: 2500, available_minor: 12500, as_of: '2026-10-22T10:00:00Z', capabilities: { can_spend: false } };
const refund = { id: 1, reference: 'REF-000001', status: 'submitted', currency: 'QAR', amount_minor: 10000, settled_amount_minor: 0, pending_amount_minor: 10000, reason: 'Service cancelled', booking_id: 1, subject_type: 'booking', subject_reference: 'BI-000001', settlement_destination: 'original_payment', can_choose_destination: true, wallet_credit_available: true, wallet_consent_at: null, created_at: wallet.as_of, processed_at: null };
async function fixture(page: Page, options: { unavailable?: boolean; approved?: boolean; booking?: boolean; mixed?: boolean } = {}) {
  const changes: unknown[] = [];
  let destination = 'original_payment';
  await page.route('**/api/customer/**', async route => {
    const path = new URL(route.request().url()).pathname.replace('/api/customer', '');
    const reply = (data: unknown, status = 200) => route.fulfill({ status, json: { success: status >= 200 && status < 300, message: '', errors: null, data } });
    const paged = (data: unknown[]) => ({ data, meta: { current_page: 1, last_page: 1, total: data.length, per_page: 20 } });
    if (path === '/auth/me') return reply({ id: 1, name: 'Wallet fixture', phone: '+97470000001', email: null });
    if (path === '/wallet') return reply(options.unavailable ? null : wallet, options.unavailable ? 503 : 200);
    if (path === '/wallet/movements') return reply(paged([{ id: 1, type: 'refund_credit', direction: 'credit', amount_minor: 15000, currency: 'QAR', occurred_at: wallet.as_of }]));
    if (path === '/wallet/reservations') return reply(paged([{ id: 1, amount_minor: 2500, currency: 'QAR', expires_at: '2026-10-22T10:15:00Z' }]));
    if (path === '/refunds/1/settlement-choice') { changes.push(route.request().postDataJSON()); destination = route.request().postDataJSON().settlement_destination; return reply({ ...refund, settlement_destination: destination }); }
    if (path === '/refunds') return reply(paged([{ ...refund, settlement_destination: destination, ...(options.mixed ? { status: 'processing', can_choose_destination: false, settled_amount_minor: 3000, pending_amount_minor: 7000, settlements: [{ sequence: 1, source: 'customer_wallet', destination: 'customer_wallet', amount_minor: 3000, currency: 'QAR', status: 'succeeded' }, { sequence: 2, source: 'original_payment', destination: 'original_payment', amount_minor: 7000, currency: 'QAR', status: 'processing' }] } : {}), ...(options.approved ? { status: 'approved', can_choose_destination: false } : {}) }]));
    if (path === '/bookings/1/refund-request') { changes.push(route.request().postDataJSON()); return reply({ id: 1, status: 'submitted', requested_amount: 100 }, 201); }
    if (path === '/bookings' && options.booking) return reply(paged([{ id: 1, reference: 'BI-000001', status: 'completed', status_label: 'Completed', scheduled_at: wallet.as_of, service_date: '2026-10-22', timezone: 'Asia/Qatar', payment_method: 'online', total: 100, notes: '', cars: [], address_area: '', created_at: wallet.as_of, payment: { status: 'paid', captured: true }, refund: null }]));
    if (path === '/loyalty') return reply(null, 503);
    return reply(paged([]));
  });
  return changes;
}

test('customer wallet shows exact funds and requires consent before choosing credit', async ({ page }) => {
  const changes = await fixture(page);
  await page.goto('/account');
  await page.getByRole('tab', { name: 'Wallet', exact: true }).click();
  await expect(page.getByText('Available credit', { exact: true })).toBeVisible();
  await expect(page.getByText('QAR 125', { exact: true })).toBeVisible();
  await expect(page.locator('dl').getByText('QAR 25', { exact: true })).toBeVisible();
  await expect(page.getByText('Refund submitted', { exact: true })).toBeVisible();
  const accessibility = await new AxeBuilder({ page }).include('[aria-labelledby="wallet-title"]').analyze();
  expect(accessibility.violations).toEqual([]);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'test-results/wallet-en.png', fullPage: true });
  await page.getByRole('combobox', { name: 'Refund destination', exact: true }).selectOption('customer_wallet');
  const save = page.getByRole('button', { name: 'Save refund destination' });
  await expect(save).toBeDisabled();
  await page.getByRole('checkbox').check();
  await save.click();
  await expect(page.getByRole('status')).toContainText('Refund destination saved. Credit appears when our team completes the refund.');
  expect(changes).toEqual([{ settlement_destination: 'customer_wallet' }]);
  await expect(page.getByText('Credited to wallet', { exact: true })).toHaveCount(0);
});

test('approved refunds are frozen and a failed balance is unavailable', async ({ page }) => {
  await fixture(page, { approved: true }); await page.goto('/account');
  await page.getByRole('tab', { name: 'Wallet', exact: true }).click();
  await expect(page.getByText('Refund approved', { exact: true })).toBeVisible();
  await expect(page.getByRole('combobox')).toHaveCount(0);
  await fixture(page, { unavailable: true });
  await page.getByRole('button', { name: 'Refresh wallet' }).click();
  await expect(page.getByRole('tabpanel', { name: 'Wallet' }).getByRole('alert')).toContainText('Wallet information is unavailable');
  await expect(page.getByText('QAR 0.00', { exact: true })).toHaveCount(0);
});

test('Arabic wallet fits 320 pixels and translates the refund journey', async ({ page, context }) => {
  await context.addCookies([{ name: 'bubbleit.lang', value: 'ar', domain: '127.0.0.1', path: '/' }]);
  await page.setViewportSize({ width: 320, height: 800 }); await fixture(page); await page.goto('/account');
  await page.getByRole('tab', { name: 'المحفظة', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'المحفظة والاستردادات' })).toBeVisible();
  await expect(page.getByText('تم تقديم طلب الاسترداد', { exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'test-results/wallet-ar.png', fullPage: true });
  const widths = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(widths[0]).toBeLessThanOrEqual(widths[1]);
});


test('customer requests a booking refund with a reason and no client-authored amount', async ({ page }) => {
  const changes = await fixture(page, { booking: true });
  await page.goto('/account');
  await page.getByRole('tab', { name: 'Bookings', exact: true }).click();
  await page.getByRole('button', { name: 'Request refund', exact: true }).click();
  const submit = page.getByRole('button', { name: 'Submit refund request', exact: true });
  await expect(submit).toBeDisabled();
  await page.getByLabel('Reason for refund').fill('Service was not completed as booked');
  await submit.click();
  await expect(page.getByRole('tab', { name: 'Wallet', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('Refund submitted', { exact: true })).toBeVisible();
  expect(changes).toEqual([{ reason: 'Service was not completed as booked' }]);
});

test('mixed refund shows settled wallet and pending original source in narrow Arabic layout', async ({ page, context }) => {
  await context.addCookies([{ name: 'bubbleit.lang', value: 'ar', domain: '127.0.0.1', path: '/' }]);
  await page.setViewportSize({ width: 320, height: 800 });
  await fixture(page, { mixed: true });
  await page.goto('/account');
  await page.getByRole('tab', { name: 'المحفظة', exact: true }).click();
  const progress = page.getByRole('list', { name: 'تقدّم الاسترداد' });
  await expect(progress.getByRole('listitem')).toHaveCount(2);
  await expect(progress).toContainText('اكتمل الاسترداد');
  await expect(progress).toContainText('جارٍ تنفيذ الاسترداد');
  expect((await new AxeBuilder({ page }).include('[aria-labelledby="wallet-title"]').analyze()).violations).toEqual([]);
  const widths = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(widths[0]).toBeLessThanOrEqual(widths[1]);
});
