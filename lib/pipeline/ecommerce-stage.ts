import * as cdk from "@aws-cdk/core"
import { ProductsFunctionStack } from "../stacks/productsFunction-stack";


export class ECommerceStage extends cdk.Stage {

  public readonly urlOutPut: cdk.CfnOutput;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {

    super(scope, id, props);

    const productsFunction = new ProductsFunction(


      this,
      "ProductsFunction",

      {

        tags: {
          ["cost"]: "ECommerce",
          ["teams"]: "pimenta"

        }


      }



    );





  }




}