import * as lambda from "@aws-cdk/aws-lambda";
import {Construct} from "@aws-cdk/core";

class LambdaBuilder {

    build(context: Construct, name: string, handler: string, concurrency: number, environment: { [p: string]: string }) {
        return new lambda.Function(context, name, {
            runtime: lambda.Runtime.NODEJS_10_X,
            code: lambda.Code.fromAsset('lambda'),
            environment: environment,
            reservedConcurrentExecutions: concurrency,
            handler: handler
        });
    }
}

export {LambdaBuilder};
