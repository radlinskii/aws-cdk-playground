#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
// import { BillingAlarmStack } from '../lib/billing-alarm';
import { CostBudgetStack } from '../lib/cost-budget';

const app = new cdk.App();

// new BillingAlarmStack(app, 'BillingAlarmStack', {
//     env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'eu-central-1' },
//     monthlyThresholdInDollars: 10,
//     email: 'radlinskiignacy@gmail.com',
// });

// eslint-disable-next-line no-new
new CostBudgetStack(app, 'CostBudgetStack', {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'eu-central-1' },
    monthlyThresholdInDollars: 10,
    email: 'radlinskiignacy@gmail.com',
});
