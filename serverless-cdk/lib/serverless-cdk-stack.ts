import * as cdk from '@aws-cdk/core';
import {Duration, Stack, StackProps} from '@aws-cdk/core';
import * as apigw from '@aws-cdk/aws-apigateway';
import {RestApi} from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import {Rule, Schedule} from '@aws-cdk/aws-events';

import {LambdaFunction} from '@aws-cdk/aws-events-targets';

import {LambdaBuilder} from "./lambdaBuilder";
import * as lambda from "@aws-cdk/aws-lambda";

// Properties defined where we determine if this is a prod stack or not
interface EnvStackProps extends StackProps {
    prod: boolean;
}

export class ServerlessCdkStack extends Stack {
    constructor(scope: cdk.Construct, id: string, props?: EnvStackProps) {
        super(scope, id, props);
        let concurrency: number;
        let lambdaVars: { TABLE_NAME: string };
        let tableName: string;
        let apiGatewayName: string;
        let dynamoDbReadWrite: number;

        // Defining the prod or no prod
        if (props && props.prod) { // prod
            dynamoDbReadWrite = 200;
            apiGatewayName = 'PROD_cdk_api';
            tableName = 'PROD_cdk_users';
            lambdaVars = {'TABLE_NAME': tableName};
            concurrency = 100;
        } else { // not prod
            tableName = 'STAGING_cdk_users';
            apiGatewayName = 'STAGING_cdk_api';
            dynamoDbReadWrite = 5;
            lambdaVars = {'TABLE_NAME': tableName};
            concurrency = 5;
        }


        // --- the dynamo db ---
        const table = new dynamodb.Table(this, 'people', {
            partitionKey: {name: 'name', type: dynamodb.AttributeType.STRING},
            tableName: tableName,
            readCapacity: dynamoDbReadWrite,
            billingMode: dynamodb.BillingMode.PROVISIONED
        });

        // --- our first api gateway ---
        const api = new apigw.RestApi(this, apiGatewayName);

        const welcomeLambda = new LambdaBuilder().build(this, "HelloHandler", 'hello.handler', concurrency, lambdaVars);
        ServerlessCdkStack.integrateLambda(welcomeLambda, api, 'hello', 'GET');

        const createLambda = new LambdaBuilder().build(this, 'CreateHandler', 'createUser.handler', concurrency, lambdaVars)
        ServerlessCdkStack.integrateLambda(createLambda, api, 'create', 'POST');
        table.grantReadWriteData(createLambda);


        const readLambda = new LambdaBuilder().build(this, 'ReadHandler', 'readUser.handler', concurrency, lambdaVars)
        ServerlessCdkStack.integrateLambda(readLambda, api, 'read', 'GET');
        table.grantReadData(readLambda);


        const countLambda = new LambdaBuilder().build(this, 'CountHandler', 'countUser.handler', concurrency, lambdaVars)
        ServerlessCdkStack.integrateLambda(countLambda, api, 'count', 'GET');
        table.grantReadData(countLambda);


        const scheduledLambda = new LambdaBuilder().build(this, 'scheduledLambda', 'scheduledLambda.handler', concurrency, lambdaVars)

        const rule = new Rule(this, 'ScheduleRule', {
            schedule: Schedule.rate(Duration.minutes(1)),
        });
        rule.addTarget(new LambdaFunction(scheduledLambda));

    }

    private static integrateLambda(welcomeLambda: lambda.Function, api: RestApi, path: string, verb: string) {
        const apiHelloInteg = new apigw.LambdaIntegration(welcomeLambda);
        const apiHello = api.root.addResource(path);
        apiHello.addMethod(verb, apiHelloInteg);
    }
}
