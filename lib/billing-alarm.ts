import * as cdk from '@aws-cdk/core';
import * as cloudwatch from '@aws-cdk/aws-cloudwatch';
import * as cloudwatchActions from '@aws-cdk/aws-cloudwatch-actions';
import * as sns from '@aws-cdk/aws-sns';
import * as snsSubscriptions from '@aws-cdk/aws-sns-subscriptions';

export interface BillingAlarmProps extends cdk.StackProps {
    email: string;
    monthlyThresholdInDollars: number;
}

export class BillingAlarmStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: BillingAlarmProps) {
        super(scope, id, props);

        const billingAlarmTopic = new sns.Topic(this, 'BillingAlarmNotificationTopic', {
            topicName: 'BillingAlarmNotificationTopic',
        });

        billingAlarmTopic.addSubscription(
            new snsSubscriptions.EmailSubscription(props.email, {
                json: true,
            })
        );

        const estimatedChargesMetric = new cloudwatch.Metric({
            namespace: 'AWS/Billing',
            metricName: 'EstimatedCharges',
            statistic: 'Maximum',
            dimensionsMap: {
                Currency: 'USD',
            },
            period: cdk.Duration.hours(9), // https://forums.aws.amazon.com/thread.jspa?threadID=135955
        });

        const billingAlarm = new cloudwatch.Alarm(this, 'BillingAlarm', {
            metric: estimatedChargesMetric,
            evaluationPeriods: 1, // 1 month
            threshold: props.monthlyThresholdInDollars,
            comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
            alarmDescription: 'Alarm for monthly estimated charges exceeding certain amount of money',
        });

        const alarmAction = new cloudwatchActions.SnsAction(billingAlarmTopic);

        billingAlarm.addAlarmAction(alarmAction);
    }
}
