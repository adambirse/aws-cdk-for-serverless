import {Construct, RemovalPolicy} from "@aws-cdk/core";
import {BlockPublicAccess, Bucket, BucketEncryption} from "@aws-cdk/aws-s3";
import {BucketDeployment, Source} from "@aws-cdk/aws-s3-deployment";

class BucketBuilder {

    buildBucket(context: Construct, id: string, name: string) {
        return new Bucket(context, id, {
            versioned: false,
            bucketName: name,
            encryption: BucketEncryption.KMS_MANAGED,
            publicReadAccess: false,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            removalPolicy: RemovalPolicy.DESTROY
        });
    }

    buildBucketDeployment(context: Construct, id: string,  directory: string, bucket: Bucket) {
        return new BucketDeployment(context, id, {
            sources: [
                Source.asset(directory)],
            destinationBucket: bucket,
        });
    }
}

export {BucketBuilder};
