import {Construct} from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

class DynamoDBBuilder {

    build(context: Construct, id: string, partionKey: string, tableName: string, readCapacity: number) {
        return new dynamodb.Table(context, id, {
            partitionKey: {name: partionKey, type: dynamodb.AttributeType.STRING},
            tableName: tableName,
            readCapacity: readCapacity,
            billingMode: dynamodb.BillingMode.PROVISIONED
        })
    }
}

export {DynamoDBBuilder};
