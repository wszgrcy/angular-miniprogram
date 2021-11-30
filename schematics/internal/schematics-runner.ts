import {
  NodeWorkflow,
  NodeWorkflowOptions,
} from '@angular-devkit/schematics/tools';
import path from 'path';

const DEFAULT_WORKFLOW_OPTIONS = {
  force: true,
  dryRun: true,
  resolvePaths: [__dirname],
  schemaValidation: true,
};
export function runSchematics<T extends object>(
  schematicName: string,
  options: T,
  workflowOptions?: NodeWorkflowOptions
) {
  workflowOptions = { ...DEFAULT_WORKFLOW_OPTIONS, ...workflowOptions };
  const nodeWorkflow = new NodeWorkflow(__dirname, workflowOptions);
  return nodeWorkflow
    .execute({
      collection: path.resolve(__dirname),
      schematic: schematicName,
      options: options,
    })
    .toPromise();
}
