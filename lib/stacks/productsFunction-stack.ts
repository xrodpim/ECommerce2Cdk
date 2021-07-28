import * as cdk from "@aws-cdk/core"
import * as lambda from "@aws-cdk/aws-lambda"
import * as lambdaNodeJS from "@aws-cdk/aws-lambda-nodejs"


export class ProductsFunctionStack extends cdk.Stack {

  readonly handler: lambdaNodeJS.NodeJsFunction;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {

    super(scope, id, props);

    this.handler = new lambdaNodeJS.NodeJsFunction(this, "ProductsFunction", {

      functionName: "ProductsFunction",
      entry: "lambda/productsFunction,js",
      handler: "handler",
      bundling: {

        minify: false,
        sourceMap: true,

      },

      tracing: lambda.Tracing.ACTIVE,
      memorySize: 128,
      timeout: cdk.Duration.seconds(30),


    });

  }

}