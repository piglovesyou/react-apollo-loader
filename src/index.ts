import { promises as fsPromises } from "fs";
import { loader } from 'webpack';
import mkdirp from "mkdirp";
import { getOptions } from 'loader-utils';
import path from 'path';
import { codegen } from "@graphql-codegen/core";
import * as typescriptPlugin from '@graphql-codegen/typescript';
import * as typescriptOperationsPlugin from '@graphql-codegen/typescript-operations';
import * as typescriptReactApolloPlugin from '@graphql-codegen/typescript-react-apollo';
import genDts from "./gen-dts";
import { DocumentNode, GraphQLSchema, parse, printSchema } from "graphql";
import {loadSchema} from "graphql-toolkit";

const { writeFile } = fsPromises;
const libDir = path.resolve(__dirname, '..');
const tsxBaseDir = path.join(libDir, '__generated__');
mkdirp.sync(tsxBaseDir);

const defaultCodegenConfig = {
  config: {
    // withHOC: false,  // True by default
    withHooks: true,    // False by default
  },
  plugins: [
    { typescript: {} },
    { 'typescript-operations': {} },
    { 'typescript-react-apollo': {} },
  ],
  pluginMap: {
    typescript: typescriptPlugin,
    'typescript-operations': typescriptOperationsPlugin,
    'typescript-react-apollo': typescriptReactApolloPlugin,
  },
};

const graphlqCodegenLoader = async function (this: loader.LoaderContext, gqlContent: string) {
  const options = getOptions(this) as any;
  const callback = this.async()!;

  const { resourcePath: gqlFullPath, rootContext: userDir } = this;

  const gqlRelPath = path.relative(userDir, gqlFullPath);
  const tsxRelPath = gqlRelPath + `.tsx`;
  const tsxFullPath = path.join(tsxBaseDir, tsxRelPath);
  const dtsFullPath = `${ gqlFullPath }.d.ts`;

  // Pretend .tsx for later loaders.
  // babel-loader at least doesn't respond the .graphql extension.
  this.resourcePath = `${ gqlFullPath }.tsx`;

  // TODO: Memoize
  const loadedSchema: GraphQLSchema = await loadSchema(options.schema);
  const schema: DocumentNode = parse(printSchema(loadedSchema));

  const codegenConfig = {
    ...defaultCodegenConfig,
    ...options,
    schema,
    filename: tsxFullPath,
    documents: [
      {
        filePath: gqlFullPath,
        content: parse(gqlContent),
      }
    ],
  };
  const tsxContent = await codegen(codegenConfig);

  const dtsContent = await genDts(tsxFullPath);
  await writeFile(dtsFullPath, dtsContent);
  callback(undefined, tsxContent);
};

export default graphlqCodegenLoader;
