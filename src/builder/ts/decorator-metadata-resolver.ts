// import {
//   PartialEvaluator,
//   TypeScriptReflectionHost,
//   reflectObjectLiteral,
// } from '@angular/compiler-cli/private/migrations';
// import type { ResolvedValue } from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
// import type {
//   Decorator,
//   Import,
// } from '@angular/compiler-cli/src/ngtsc/reflection';
// import * as path from 'path';
// import ts, { Program, SourceFile, Type, TypeChecker } from 'typescript';
// import { nodeIteration } from './node-Iteration';

// export class DecoratorMetaDataResolver {
//   private componentMetaMap = new Map<
//     ts.ClassDeclaration,
//     Record<string, ResolvedValue>
//   >();

//   private isCore: boolean;
//   private reflector: TypeScriptReflectionHost;
//   private evaluator: PartialEvaluator;
//   constructor(private program: Program, private typeChecker: TypeChecker) {
//     // todo
//     this.isCore = false;
//     this.reflector = new TypeScriptReflectionHost(this.typeChecker);
//     this.evaluator = new PartialEvaluator(
//       this.reflector,
//       this.typeChecker,
//       null
//     );
//   }
//   resolverSourceFile(sf: SourceFile) {
//     const list: ts.ClassDeclaration[] = [];
//     nodeIteration(sf, (node) => {
//       if (ts.isClassDeclaration(node) && node.decorators) {
//         list.push(node);
//       }
//     });
//     list.forEach((item) => {
//       if (this.reflector.isClass(item)) {
//         const decoratorList = this.reflector.getDecoratorsOfDeclaration(item)!;
//         this.findComponentDecorator(decoratorList, item);
//       }
//     });
//   }
//   getComponentMetaMap() {
//     return this.componentMetaMap;
//   }
//   private evaluate(node: ts.Expression) {
//     return this.evaluator.evaluate(node);
//   }
//   private findComponentDecorator(
//     decoratorList: Decorator[],
//     classDeclaration: ts.ClassDeclaration
//   ) {
//     const decorator = findAngularDecorator(
//       decoratorList,
//       'Component',
//       this.isCore
//     );
//     if (!decorator) {
//       return;
//     }
//     const meta: ts.ObjectLiteralExpression = unwrapExpression(
//       decorator.args![0]
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     ) as any;
//     if (!ts.isObjectLiteralExpression(meta)) {
//       throw new Error('Decorator argument must be literal.');
//     }
//     const metaMap = reflectObjectLiteral(meta);
//     this.componentMetaMap.set(classDeclaration, {
//       styles: metaMap.has('styles') && this.evaluate(metaMap.get('styles')!),
//       styleUrls:
//         metaMap.has('styleUrls') &&
//         (this.evaluate(metaMap.get('styleUrls')!) as string[]).map((item) =>
//           path.resolve(
//             path.dirname(classDeclaration.getSourceFile().fileName),
//             item as string
//           )
//         ),
//     });
//   }
// }

// export function findAngularDecorator(
//   decorators: Decorator[],
//   name: string,
//   isCore: boolean
// ): Decorator | undefined {
//   return decorators.find((decorator) =>
//     isAngularDecorator(decorator, name, isCore)
//   );
// }

// export function isAngularDecorator(
//   decorator: Decorator,
//   name: string,
//   isCore: boolean
// ): boolean {
//   if (isCore) {
//     return decorator.name === name;
//   } else if (isAngularCore(decorator)) {
//     return decorator.import.name === name;
//   }
//   return false;
// }
// export function isAngularCore(
//   decorator: Decorator
// ): decorator is Decorator & { import: Import } {
//   return decorator.import !== null && decorator.import.from === '@angular/core';
// }
// export function unwrapExpression(node: ts.Expression): ts.Expression {
//   while (ts.isAsExpression(node) || ts.isParenthesizedExpression(node)) {
//     node = node.expression;
//   }
//   return node;
// }
export default {};
