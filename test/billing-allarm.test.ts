/* eslint-disable jest/expect-expect */
import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { BillingAlarmStack } from '../lib/billing-alarm';

test('BillingAlarmStack', () => {
    const app = new cdk.App();
    // WHEN
    const monthlyThresholdInDollars = 12;
    const email = 'test@test.test';
    const stack = new BillingAlarmStack(app, 'TestBillingStack', {
        monthlyThresholdInDollars,
        email,
    });

    // THEN
    expectCDK(stack).to(haveResource('AWS::SNS::Topic'));
    expectCDK(stack).to(
        haveResource('AWS::SNS::Subscription', {
            Protocol: 'email-json',
            Endpoint: email,
        })
    );
    expectCDK(stack).to(
        haveResource('AWS::CloudWatch::Alarm', {
            AlarmDescription: 'Alarm for monthly estimated charges exceeding certain amount of money',
            Dimensions: [
                {
                    Name: 'Currency',
                    Value: 'USD',
                },
            ],
            MetricName: 'EstimatedCharges',
            Namespace: 'AWS/Billing',
            Period: 32400,
            Statistic: 'Maximum',
            Threshold: monthlyThresholdInDollars,
        })
    );
});
