/* eslint-disable jest/expect-expect */
import { Match, Template } from 'aws-cdk-lib/assertions';
import { App } from 'aws-cdk-lib';
import { CostBudgetStack } from '../lib/cost-budget';

describe('CostBudgetStack', () => {
    const app = new App();
    const monthlyThresholdInDollars = 12;
    const email = 'test@test.test';
    const stack = new CostBudgetStack(app, 'TestCostBudgetStack', {
        monthlyThresholdInDollars,
        email,
    });
    const template = Template.fromStack(stack);

    test('creates a Budget', () => {
        template.resourceCountIs('AWS::Budgets::Budget', 1);
    });

    test('creates a Budget with strictly matching propeties', () => {
        template.hasResourceProperties(
            'AWS::Budgets::Budget',
            Match.objectEquals({
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
});
