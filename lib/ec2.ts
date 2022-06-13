/* eslint-disable no-new */

import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import type { Construct } from 'constructs';
import { KeyPair } from 'cdk-ec2-key-pair';

export class Ec2Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create the Key Pair
        const key = new KeyPair(this, 'A-Key-Pair', {
            name: 'ec2-key-pair',
            description: 'This is a Key Pair',
            storePublicKey: true, // by default the public key will not be stored in Secrets Manager
        });

        const vpc = new ec2.Vpc(this, 'VPC', {
            natGateways: 0,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'asterisk',
                    subnetType: ec2.SubnetType.PUBLIC,
                },
            ],
        });

        const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
            vpc,
            description: 'Allow SSH (TCP port 22) in',
            allowAllOutbound: true,
        });

        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH Access');

        const role = new iam.Role(this, 'ec2Role', {
            assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
        });

        role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'));

        const ami = new ec2.AmazonLinuxImage({
            generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
            cpuType: ec2.AmazonLinuxCpuType.X86_64,
        });

        const ec2Instance = new ec2.Instance(this, 'Instance', {
            vpc,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
            machineImage: ami,
            securityGroup,
            role,
            keyName: key.keyPairName,
        });

        new cdk.CfnOutput(this, 'ip address', { value: ec2Instance.instancePublicIp });
        new cdk.CfnOutput(this, 'download key command', {
            value: `aws secretsmanager get-secret-value --region ${props?.env?.region} --secret-id ${key.privateKeyArn} --query SecretString --output text > cdk-key.pem && chmod 400 cdk-key.pem`,
        });
        new cdk.CfnOutput(this, 'ssh command', {
            value: `ssh -i cdk-key.pem -o IdentitiesOnly=yes ec2-user@${ec2Instance.instancePublicIp}`,
        });
    }
}
