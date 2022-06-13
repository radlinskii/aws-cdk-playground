/* eslint-disable jest/expect-expect */
import { Template } from 'aws-cdk-lib/assertions';
import { App } from 'aws-cdk-lib';
import { Ec2Stack } from '../lib/ec2';

describe('Ec2Stack', () => {
    const app = new App();

    const stack = new Ec2Stack(app, 'TestEc2Stack');
    const template = Template.fromStack(stack);

    test('creates an EC2 instance', () => {
        template.resourceCountIs('AWS::EC2::Instance', 1);
    });
});
