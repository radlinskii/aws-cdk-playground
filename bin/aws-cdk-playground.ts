#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
// import { BillingAlarmStack } from '../lib/billing-alarm';
import { CostBudgetStack } from '../lib/cost-budget';

const app = new App();

/* eslint-disable no-new */
// new BillingAlarmStack(app, 'BillingAlarmStack', {
//     env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'eu-central-1' },
//     monthlyThresholdInDollars: 10,
//     email: 'john.doe@example.com',
// });

new CostBudgetStack(app, 'CostBudgetStack', {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'eu-central-1' },
    monthlyThresholdInDollars: 10,
    email: 'john.doe@example.com',
});
