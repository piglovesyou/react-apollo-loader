import { loader } from 'webpack';
import { createCompilerHost, createProgram, CompilerOptions } from "typescript";
import { promises as fsPromises } from "fs";
import path from "path";
import { generate } from "@graphql-codegen/cli";

const { writeFile } = fsPromises;

const options: CompilerOptions = {
  declaration: true,
  emitDeclarationOnly: true,
};

function generateDts(inputFileName: string): string {
  let outputText: string;
  const compilerHost = createCompilerHost({});
  compilerHost.writeFile = (name /*: string */, text /*: string */) => {
    // debugger
    outputText = text;
  };

  const program = createProgram([ inputFileName ], options, compilerHost);
  program.emit(
      // /* sourceFile */ undefined,
      // /* writeFileCallback */ undefined,
      // /* cancellationToken */ undefined,
      // /* emitOnlyDtsFiles */ true,
      // /* transformers */ undefined,
      // /* forceDtsEmit */ true,
  );

  return outputText!; // !;
}

const graphlqCodegenLoader = async function (this: loader.LoaderContext, gqlContent: string) {
  const callback = this.async()!;

  const { resourcePath, rootContext } = this;

  const userDir = rootContext;
  const tsxBaseDir = path.join(userDir, '__generated__');
// TODO: mkdir
  const schemaPath = path.join(userDir, './schema.graphql');
  console.log(schemaPath);

  const gqlRelPath = path.relative(userDir, resourcePath);
  const gqlRelDir = path.dirname(gqlRelPath);
  const tsxBaseName = path.basename(gqlRelPath, '.graphql');
  const tsxRelPath = path.join(gqlRelDir, `${ tsxBaseName }.tsx`);
  const tsxFullPath = path.join(tsxBaseDir, tsxRelPath);
  const dtsFullPath = `${ resourcePath }.d.ts`;

  console.log(resourcePath);
  this.resourcePath = `${ resourcePath }.tsx`; // Pretend tsx for later loaders

  const [ { content: tsxContent } ] = await generate(
      {
        schema: schemaPath,
        documents: gqlContent,
        generates: {
          [tsxFullPath]: {
            plugins: [
              'typescript',
              'typescript-operations',
              'typescript-react-apollo',
            ],
            config: {
              // withHOC: false,
              withHooks: true,
            },
          },
        },
      },
      true,
  );

  // debugger
  const dtsContent = await generateDts(tsxFullPath);

  await writeFile(dtsFullPath, dtsContent);

  // console.log(dtsContent);
  callback(undefined, tsxContent);
};

export default graphlqCodegenLoader;
