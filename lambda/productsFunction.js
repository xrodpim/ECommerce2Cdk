const AWS = require("aws-sdk");
const AWSXRay = require("aws-xray-sdk-core");
const uuid = require("uuid");

const xRay = AWSXRay.captureAWS(require("aws-sdk"));

const productsDbd = process.env.PRDUCTS_DDB;

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

  if (event.resource === "/products") {
    if (method === "GET") {
      console.log("GET /products");

      const data = await getAllProducts();


      return {
        statusCode: 200,
        headers: {},
        body: JSON.stringify(dta.Items)
      };
    } else if (method === "POST") {
      const product = JSON.parse(event.body);
      product.id = uuid.v4();


      await createProduct(product);

      return {
        statusCode: 201,
        body: JSON.stringify(product),
      }
    }
  } else if (event.resource === "/products/{id}") {

    const productID = event.pathParameters.id;
    if (method === "GET") {
      const data = await getProductById(productID);
      if (data.Item) {
        return {
          statusCode: 200,
          body: JSON.stringify(data.Item),
        }
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify('PRoduct with ID $ {productId} not found'),
        }
      }
    } else if (method === "PUT") {
      const data = await getPRoductById(productID);
      if (data.Item) {

        const product = JSON.parse(event.body)
        const result = await updateProduct(productId, product);
        console.log(result);

        return {
          statusCode: 200,
          body: JSON.stringify(product),
        };
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify('PRoduct with ID $ {productId} not found'),
        };
      }

    } else if (method === "DELETE") {
      const data = await getPRoductById(productID);
      if (data.Item) {
        const result = await deleteProduct(productID);
        console.log(result);
        return {
          statusCode: 200,
          body: JSON.stringify(data.Item),
        }
      }
      else {
        return {
          statusCode: 404,
          body: JSON.stringify('PRoduct with ID $ {productId} not found'),
        };
      }
    }

  }

  return {
    statusCode: 400,
    headers: {},
    body: JSON.stringify({
      message: "Bad request",
      ApiGwRequestId: apiRequestId,
      LambdaRequestId: lambdaRequestId,
    }),
  };


  function deleteProduct(productId) {

    const params = {
      TableName: productsDbd,
      key: {
        id: productId,
      },
      ReturnValues: "ALL_OLD"
    }

    try {
      return ddbClient.delete(params).promise();
    } catch (err) {
      console.log(err);
    }



  }

  function updateProduct(productId, product) {
    const params = {
      TableName: productsDbd,
      Key: {
        id: productId
      },
      UpdateExpression: "set productName = :n, code = :c, price = :p, model = :m",
      ExpressionAttributesValues: {
        ":n": product.productName,
        ":c": product.code,
        ":p": product.price,
        ":m": product.model
      },
      ReturnValues: "UPDATE_NEW",
    };

    try {
      return ddbClient.update(params).promise();
    } catch (err) {
      return err;
    }
  }

  function getProductById(productId) {
    const params = {
      key: {
        id: productId,
      }
    }

    try {
      return ddbClient.get(params).promise();
    } catch (err) {
      console.log(err);
    }

  }



  function createProduct(product) {
    const params = {
      TableName: productsDbd,
      Item: {
        id: product.id,
        productName: product.productName,
        code: product.code,
        price: product.price,
        model: product.model,
      }
    };

    try {
      return ddbClient.put(param).promise();
    } catch (err) {
      console.log(err);
    }


  }

  function getAllProducts() {
    try {
      const params = {
        TableName: productsDbd,
      };
      return ddbClient.scan(param).promise();
    } catch (err) {
      console.log(err);
    }
  }



};