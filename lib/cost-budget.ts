import * as cdk from '@aws-cdk/core';
import * as budgets from '@aws-cdk/aws-budgets';

export interface CostBudgetProps extends cdk.StackProps {
    email: string;
    monthlyThresholdInDollars: number;
}

export class CostBudgetStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: CostBudgetProps) {
        super(scope, id, props);

        // eslint-disable-next-line no-new
        new budgets.CfnBudget(this, id, {
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
