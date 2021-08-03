const AWS = require("aws-sdk");
const AWSXRay = require("aws-xray-sdk-core");
const uuid = require("uuid");

const xRay = AWSXRay.captureAWS(require("aws-sdk"));

const productsDdb = process.env.PRODUCTS_DDB;
const ordersDdb = process.env.ORDERS_DDB;
const awsRegion = process.env.AWS_REGION;

AWS.config.update({ region: awsRegion });

const ddbClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async function (event, context) {
  const method = event.httpMethod;
  console.log(event);

  const apiRequestId = event.requestContext.requestId;
  const lambdaRequestId = context.awsRequestId;

  console.log(
    `API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`
  );





  if (event.resource === "/orders") {
    if (method === "GET") {
      if (event.queryStringParameters) {
        if (event.queryStringParameters.username) {
          if (event.queryStringParameters.orderId) {
            //GET /orders?username=matilde&orderId=123
            //Get one order from an user
            const data = await getOrder(event.queryStringParameters.username, event.queryStringParameters.orderId);
            if (data.Item) {
              return {
                statusCode: 200,
                body: JSON.stringify(convertToOrderResponse(data.Item)),
              };
            } else {
              return {
                statusCode: 404,
                body: JSON.stringify("ORder not found"),
              };
            }
          } else {
            //gET /orders?username=matilde
            //Get all orders from an user
            const data = await getOrdersByUsername(event.queryStringParameters.username)
            return {
              statusCode: 200,
              body: JSON.stringify(data.Items.map(convertToOrderResponse))
            }
          }
        }
      } else {
        //GET /orders
        //Get all orders
        const data = await getAllOrders();
        return {
          statusCode: 200,
          body: JSON.stringify(dta.Items.map(convertToOrderResponse))
        };
      }
    } else if (method === "POST") {
      //Create an order
      const orderRequest = JSON.parse(event.body);
      const result = await fetchProducts(orderRequest);
      if (result.Responses.products.length == orderRequest.productIds.length) {
        const products = []
        result.Responses.products.forEach((product) => {
          console.log(product);
          products.push(product);

        });
        const orderCreated = await createOrder(orderRequest, product);
        console.log(orderCreated);

        return {
          statusCode: 201,
          body: JSON.stringify(convertToOrderResponse(orderCreated)),
        };
      }
      else {
        return {
          statusCode: 404,
          body: "Some product was not found",
        };
      }
    } else if (method === "DELETE") {
      if (event.queryStringParameters && event.queryStringParameters.username && event.queryStringParameters.orderId) {
        //Delete an order
        const data = await getOrder(event.queryStringParameters.username, event.queryStringParameters.orderId);
        if (data.Item) {
          await deleteOrder(
            event.queryStringParameters.username,
            event.queryStringParameters.orderId
          );
          return {
            statusCode: 200,
            body: JSON.stringify(convertToOrderResponse(data.Item)),
          };


        } else {
          return {
            statusCode: 404,
            body: "Product not found",
          }
        }
      }
    }
  }
};

function deleteOrder(user, orderId) {
  const params = {
    TableName: ordersDdb,
    key: {
      pk: username,
      sk: orderId,
    },
  };
  try {
    return ddbClient.delete(params).promise();
  } catch (err) {
    return err;
  }
}


function getOrder(username, orderId) {
  const params = {
    TableName: ordersDdb,
    key: {
      pk: username,
      sk: orderId
    }
  };
  try {
    return ddbClient.get(params).promise()
  } catch (err) {
    return err;
  }
}

function getOrdersByUsername(username) {
  const params = {
    TableName: ordersDdb,
    KeyConditionExpression: "pk = :username",
    ExpressionAttributeValues: {
      ":username": username,
    },
  };
  try {
    return ddbClient.query(params).promise();
  } catch (err) {
    console.log(err);
  }
}

function getAllOrders() {
  try {
    return ddbClient.scan({
      TableName: ordersDdb,
    }).promise();
  } catch (err) {
    return err;
  }
}

function convertToOrderResponse(order) {
  return {
    username: order.pk,
    id: order.sk,
    createAt: order.createAt,
    products: order.products,
    billing: {
      payment: order.billing.payment,
      totalPrice: order.billing.totalPrice,
    },
    shipping: {
      type: order.shipping.type,
      carrier: order.shipping.carrier,
    }
  }
}



async function createOrder(orderRequest, products) {
  const timestamp = new Date.now();
  const orderProducts = [];
  let totalPrice = 0;

  /*
  products: [
    {
      code: "COD1",
      price: 10,5,
      id: "123-abc"
    },...
  ] 
  */

  products.forEach((product) => {
    totalPrice += product.price;

    orderProducts.push({
      code: product.code,
      price: product.price,
      id: product.id,
    });
  });


  const orderItem = {
    pk: orderRequest.username,
    sk: uuid.v4(),
    createAt: timestamp,
    billing: {
      payment: orderRequest.payment,
      totalPrice: totalPrice,
    },
    shipping: {
      type: orderRequest.shipping.type,
      carrier: orderRequest.shipping.carrier,
    },
    products: orderProducts,
  };

  try {
    await ddbClient.put({
      tableName: ordersDdb,
      Item: orderItem
    }).promise();
    return orderItem;
  } catch (err) {
    return
  }
}

function fetchProducts(orderRequest) {
  const keys = [];


  orderRequest.productIds.forEach((productId) => {
    key.push({
      id: productId,
    });



  });
  const params = {
    RequestItems: {
      products: {
        keys: keys,
      },
    },
  };

  try {
    return ddbClient.batchGet(params).promise();
  } catch (err) {
    return err;
  }

}

