import type { StackProps } from 'aws-cdk-lib';
import { Duration, Stack } from 'aws-cdk-lib';
import { Alarm, ComparisonOperator, Metric } from 'aws-cdk-lib/aws-cloudwatch';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { EmailSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import type { Construct } from 'constructs';

export interface BillingAlarmProps extends StackProps {
    email: string;
    monthlyThresholdInDollars: number;
}

export class BillingAlarmStack extends Stack {
    constructor(scope: Construct, id: string, props: BillingAlarmProps) {
        super(scope, id, props);

        const billingAlarmTopic = new Topic(this, 'BillingAlarmNotificationTopic', {
            topicName: 'BillingAlarmNotificationTopic',
        });

        billingAlarmTopic.addSubscription(
            new EmailSubscription(props.email, {
                json: true,
            })
        );

        const estimatedChargesMetric = new Metric({
            namespace: 'AWS/Billing',
            metricName: 'EstimatedCharges',
            statistic: 'Maximum',
            dimensionsMap: {
                Currency: 'USD',
            },
            period: Duration.hours(9), // https://forums.aws.amazon.com/thread.jspa?threadID=135955
        });

        const billingAlarm = new Alarm(this, 'BillingAlarm', {
            metric: estimatedChargesMetric,
            evaluationPeriods: 1, // 1 month
            threshold: props.monthlyThresholdInDollars,
            comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
            alarmDescription: 'Alarm for monthly estimated charges exceeding certain amount of money',
        });

        const alarmAction = new SnsAction(billingAlarmTopic);

        billingAlarm.addAlarmAction(alarmAction);
    }
}
