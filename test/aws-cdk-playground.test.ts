/* eslint-disable jest/expect-expect */
import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as AwsCdkPlayground from '../lib/billing-alarm';

test('BillingAlarmStack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new AwsCdkPlayground.BillingAlarmStack(app, 'TestBillingStack', {
        monthlyThresholdInDollars: 1,
        email: 'test@test.test',
    });
    // THEN
    expectCDK(stack).to(
        matchTemplate(
            {
                'Resources': {},
            },
            MatchStyle.EXACT
        )
    );
});
