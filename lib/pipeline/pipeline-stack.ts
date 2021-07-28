import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as cdk from "@aws-cdk/core";
import { CdkPipeline, SimpleSynthAction } from "@aws-cdk/pipelines";
import { pipeline } from "stream";
import { ECommerceStage } from "./ecommerce-stage";

export class PipelineStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {

    super(scope, id, props);
    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    const pipelines = new CdkPipeline(this, "Pipeline", {
      pipelineName: "ECommercePipeline",
      cloudAssemblyArtifact,

      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: "GitHub",
        output: sourceArtifact,
        oauthToken: cdk.SecretValue.secretsManager("github2-token"),
        owner: "xrodpim",
        repo: "ECommerce2Cdk",
        branch: "master"
      }),

      synthAction: SimpleSynthAction.standardNpmSynth({
        sourceArtifact,
        cloudAssemblyArtifact,
        installCommand: "npx npm@6 install && npm install -g typescript && npm install -g aws-cdk",
        buildCommand: "npm run build",
        environment: {
          privileged: true,
        }

      })

    });

    //TODO: estágio para fazer o deploy de fato.
    pipeline.addApplicationStage(
      new ECommerceStage(this, "Stage1", {

        env: {
          account: "336605837729",
          region: "us-east-1"
        }
      })
    )

  }

}