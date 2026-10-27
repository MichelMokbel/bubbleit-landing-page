import {defineConfig, devices} from '@playwright/test';
export default defineConfig({
  testDir: './tests/wallet-e2e', fullyParallel: false, workers: 1, retries: 0,
  reporter: 'line', timeout: 90000,
  use: {baseURL:'http://127.0.0.1:3100',trace:'retain-on-failure'},
  projects:[{name:'chromium',use:{...devices['Desktop Chrome']}}],
  webServer:[
    {command:'ACCOUNTING_LOCAL_API_PORT=8840 bash ../bubbleit-backend/scripts/accounting-local/qa.sh serve-wallet-e2e',url:'http://127.0.0.1:8840/api/health',reuseExistingServer:false,timeout:120000},
    {command:'npm run dev -- --hostname 127.0.0.1 --port 3100',url:'http://127.0.0.1:3100/account',reuseExistingServer:false,timeout:120000,env:{CUSTOMER_API_BASE:'http://127.0.0.1:8840/api/v1/customer',CSP_MODE:'enforce'}},
  ],
});
