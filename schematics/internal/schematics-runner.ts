import {
  NodeWorkflow,
  NodeWorkflowOptions,
} from '@angular-devkit/schematics/tools';
import path from 'path';
import { SchematicsType } from './type';

const DEFAULT_WORKFLOW_OPTIONS = {
  force: true,
  dryRun: true,
  resolvePaths: [__dirname],
  schemaValidation: true,
};
export function runSchematics<T extends keyof SchematicsType>(
  schematicName: T,
  options: SchematicsType[T],
  workflowOptions?: NodeWorkflowOptions
) {
  workflowOptions = { ...DEFAULT_WORKFLOW_OPTIONS, ...workflowOptions };
  const nodeWorkflow = new NodeWorkflow(process.cwd(), workflowOptions);
  nodeWorkflow.reporter.subscribe((event) => {
    console.log(event.kind, event.path);
  });
  return nodeWorkflow
    .execute({
      collection: path.resolve(__dirname),
      schematic: schematicName,
      options: options,
    })
    .toPromise();
}
