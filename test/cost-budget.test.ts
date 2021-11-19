/* eslint-disable jest/expect-expect */
import { expect as expectCDK, haveResourceLike } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { CostBudgetStack } from '../lib/cost-budget';

test('CostBudgetStack', () => {
    const app = new cdk.App();
    // WHEN
    const monthlyThresholdInDollars = 12;
    const email = 'test@test.test';
    const stack = new CostBudgetStack(app, 'TestCostBudgetStack', {
        monthlyThresholdInDollars,
        email,
    });

    // THEN
    expectCDK(stack).to(
        haveResourceLike('AWS::Budgets::Budget', {
            Budget: {
                BudgetLimit: {
                    Amount: monthlyThresholdInDollars,
                    Unit: 'USD',
                },
                BudgetName: 'CostBudget',
                BudgetType: 'COST',
                TimeUnit: 'MONTHLY',
            },
            NotificationsWithSubscribers: [
                {
                    Notification: {
                        ComparisonOperator: 'GREATER_THAN',
                        NotificationType: 'FORECASTED',
                        Threshold: monthlyThresholdInDollars,
                        ThresholdType: 'ABSOLUTE_VALUE',
                    },
                    Subscribers: [
                        {
                            Address: email,
                            SubscriptionType: 'EMAIL',
                        },
                    ],
                },
            ],
        })
    );
});
