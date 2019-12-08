import { loader } from 'webpack';
import { promises as fsPromises, mkdirSync } from "fs";
import { getOptions } from 'loader-utils';
import path from "path";
import { generate } from "@graphql-codegen/cli";
import genDts from "./gen-dts";
import merge from 'lodash.merge';

import mkdirp from "mkdirp";
const { writeFile } = fsPromises;

const libDir = path.resolve(__dirname, '..');
const tsxBaseDir = path.join(libDir, '__generated__');
mkdirp.sync(tsxBaseDir);

const graphlqCodegenLoader = async function (this: loader.LoaderContext, gqlContent: string) {
  const options = getOptions(this);
  const callback = this.async()!;

  const { resourcePath: gqlFullPath, rootContext: userDir } = this;

  const gqlRelPath = path.relative(userDir, gqlFullPath);
  const tsxRelPath = gqlRelPath +  `.tsx`;
  const tsxFullPath = path.join(tsxBaseDir, tsxRelPath);
  const dtsFullPath = `${ gqlFullPath }.d.ts`;

  // Pretend .tsx for later loaders.
  // babel-loader at least doesn't respond the .graphql extension.
  this.resourcePath = `${ gqlFullPath }.tsx`;

  const [ { content: tsxContent } ] = await generate(
      merge(
          {
            config: {
              // withHOC: false,  // True by default
              withHooks: true,    // False by default
            },
          },
          options,
          {
            documents: gqlContent,
            generates: {
              [tsxFullPath]: {
                plugins: [
                  'typescript',
                  'typescript-operations',
                  'typescript-react-apollo',
                ],
              },
            },
          }
      ) ,
      true,
  );

  const dtsContent = await genDts(tsxFullPath);
  await writeFile(dtsFullPath, dtsContent);
  callback(undefined, tsxContent);
};

export default graphlqCodegenLoader;
