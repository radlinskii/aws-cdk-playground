import type { StackProps } from 'aws-cdk-lib';
import { Stack } from 'aws-cdk-lib';
import { CfnBudget } from 'aws-cdk-lib/aws-budgets';
import type { Construct } from 'constructs';

export interface CostBudgetProps extends StackProps {
    email: string;
    monthlyThresholdInDollars: number;
}

export class CostBudgetStack extends Stack {
    constructor(scope: Construct, id: string, props: CostBudgetProps) {
        super(scope, id, props);

        // eslint-disable-next-line no-new
        new CfnBudget(this, id, {
            budget: {
                budgetLimit: {
                    amount: props.monthlyThresholdInDollars,
                    unit: 'USD',
                },
                budgetName: 'CostBudget',
                budgetType: 'COST',
                timeUnit: 'MONTHLY',
            },
            notificationsWithSubscribers: [
                {
                    notification: {
                        comparisonOperator: 'GREATER_THAN',
                        notificationType: 'FORECASTED',
                        threshold: props.monthlyThresholdInDollars,
                        thresholdType: 'ABSOLUTE_VALUE',
                    },
                    subscribers: [
                        {
                            address: props.email,
                            subscriptionType: 'EMAIL',
                        },
                    ],
                },
            ],
        });
    }
}
