/* eslint-disable jest/expect-expect */
import { Capture, Match, Template } from 'aws-cdk-lib/assertions';
import { App } from 'aws-cdk-lib';
import { BillingAlarmStack } from '../lib/billing-alarm';

describe('BillingAlarmStack', () => {
    const app = new App();
    const monthlyThresholdInDollars = 12;
    const email = 'test@test.test';
    const stack = new BillingAlarmStack(app, 'TestBillingAlarmStack', {
        monthlyThresholdInDollars,
        email,
    });
    const template = Template.fromStack(stack);

    test('creates an SNS Topic', () => {
        template.resourceCountIs('AWS::SNS::Topic', 1);
    });
    test('creates an SNS Subscription with correct properties', () => {
        template.hasResourceProperties('AWS::SNS::Subscription', {
            Protocol: 'email-json',
            Endpoint: email,
        });
    });
    test('creates CloudWatch Alarm with strictly matching propeties', () => {
        template.hasResourceProperties(
            'AWS::CloudWatch::Alarm',
            Match.objectEquals({
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
                ComparisonOperator: 'GreaterThanThreshold',
                EvaluationPeriods: 1,
                AlarmActions: [
                    {
                        Ref: Match.anyValue(),
                    },
                ],
            })
        );
    });
    test('creates CloudWatch Alarm with correct Alarm Action', () => {
        const alarmActionCapture = new Capture();

        template.hasResourceProperties('AWS::CloudWatch::Alarm', {
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
            ComparisonOperator: 'GreaterThanThreshold',
            EvaluationPeriods: 1,
            AlarmActions: [
                {
                    Ref: alarmActionCapture,
                },
            ],
        });

        expect(alarmActionCapture.asString()).toEqual(expect.stringMatching(/^BillingAlarmNotificationTopic/));
    });
});
