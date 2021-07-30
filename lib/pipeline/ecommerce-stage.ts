import * as cdk from "@aws-cdk/core"
import { ProductsFunctionStack } from "../stacks/productsFunction-stack";
import { ECommerceApiStack } from "../stacks/ecommerceApi-stack";
import { ProductsDbdStack } from "../stacks/productsDbd-stack";
import { EventsDbdStack } from "../stacks/eventsDbd-stack";
import { ProductsEventFunctionStack } from "../stacks/productEventsFunction-stack";

export class ECommerceStage extends cdk.Stage {

  public readonly urlOutPut: cdk.CfnOutput;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {

    super(scope, id, props);

    const tags = {
      ["cost"]: "ECommerce",
      ["team"]: "pimenta",
    };

    const productsDbdStack = new ProductsDbdStack(
      this, "ProductsDbd", {
      tags: tags,
    }
    );

    const eventsDbdStack = new EventsDbdStack(this, "EventsDbd", {
      tags: tags,
    })


    const productEventsFunctionStack = new ProductsEventFunctionStack(this, "ProductEventsFunction",
      eventsDbdStack.table,
      {
        tags: tags,
      });

    productEventsFunctionStack.addDependency(eventsDbdStack);





    const productsFunctionStack = new ProductsFunctionStack(


      this,
      "ProductsFunction",
      productsDbdStack.table,
      productEventsFunctionStack.handler,

      {
        tags: tags,
      }

    );


    productsFunctionStack.addDependency(productsDbdStack);
    productsFunctionStack.addDependency(productEventsFunctionStack);

    const eCommerceApiStack = new ECommerceApiStack(
      this,
      "ECommerceAPI",
      productsFunctionStack.handler,
      {
        tags: tags,
      }
    );

    eCommerceApiStack.addDependency(productsFunctionStack);

    this.urlOutPut = eCommerceApiStack.urlOutput;





  }




}