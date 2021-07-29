#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PipelineStack } from '../lib/pipeline/pipeline-stack';

const app = new cdk.App();


new PipelineStack(app, "PipelineStack", {
  env: {
    account: "336605837729",
    region: "us-east-1",
  },

  tags: {
    ["cost"]: "ECommerce",  //apenas uma tag qualquer.
    ["team"]: "pimenta"
  }

});
app.synth();


