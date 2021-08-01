import * as cdk from "@aws-cdk/core"
import { ProductsFunctionStack } from "../stacks/productsFunction-stack";
import { ECommerceApiStack } from "../stacks/ecommerceApi-stack";
import { ProductsDdbStack } from "../stacks/productsDbd-stack";
import { EventsDdbStack } from "../stacks/eventsDbd-stack";
import { ProductEventsFunctionStack } from "../stacks/productEventsFunction-stack";

export class ECommerceStage extends cdk.Stage {

  public readonly urlOutPut: cdk.CfnOutput;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {

    super(scope, id, props);

    const tags = {
      ["cost"]: "ECommerce",
      ["team"]: "pimenta",
    };

    const productsDdbStack = new ProductsDdbStack(
      this, "ProductsDdb", {
      tags: tags,
    }
    );

    const eventsDdbStack = new EventsDdbStack(this, "EventsDbd", {
      tags: tags,
    })


    const productEventsFunctionStack = new ProductEventsFunctionStack(this, "ProductEventsFunction",
      eventsDdbStack.table,
      {
        tags: tags,
      }
    );

    productEventsFunctionStack.addDependency(eventsDdbStack);

    const productsFunctionStack = new ProductsFunctionStack(

      this,
      "ProductsFunction",
      productsDdbStack.table,
      productEventsFunctionStack.handler,

      {
        tags: tags,
      }

    );


    productsFunctionStack.addDependency(productsDdbStack);
    productsFunctionStack.addDependency(productEventsFunctionStack);

    const eCommerceApiStack = new ECommerceApiStack(
      this,
      "ECommerceApi",
      productsFunctionStack.handler,
      {
        tags: tags,
      }
    );

    eCommerceApiStack.addDependency(productsFunctionStack);

    this.urlOutPut = eCommerceApiStack.urlOutput;

  }
}