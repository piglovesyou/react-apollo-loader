# react-apollo-loader

A webpack loader to make those who use [React Apollo](https://github.com/apollographql/react-apollo#readme) and [GraphQL Code Generator](https://graphql-code-generator.com/) _happier_. You can do:

```typescript
import { useMyQuery } from './myQuery.graphql';

export defautl function(props: {}) {
  const { data, loading } = useMyQuery();
  
  return loading ? <div>loading</div> : <div>{data!.myQuery.text}</div>;
}
```

[The blog post](https://dev.to/piglovesyou/react-apollo-loader-enhance-react-apollo-typescript-and-graphql-utilization-45h0)

# Restrictions

Make sure you

* like [Apollo](https://www.apollographql.com/)
* use [Apollo Client](https://github.com/apollographql/apollo-client#readme) with [TypeScript](https://www.typescriptlang.org/)
* have a valid GraphQL server
* are willing to have **typed** GraphQL response
* have all your GraphQL documents in `.graphql` files, instead of `.tsx` ←This's going to be the preparation for setup

# Setup

1. Install react-apollo-loader

```bash
yarn add -D react-apollo-loader
```

2. Add the line to your `.gitignore`
    * react-apollo-loader will generate `.d.ts` right next to your `.graphql` GraphQL document files.

```diff
+*.graphql.d.ts
```

3. Make sure you have `schema.graphql` **OR** a GraphQL Server up and running. I recommend you to have `schema.graphql`

4. Setup the GraphQL document scanner in your `webpack.config.{js,ts}`. Note: 
    * Make sure you're including only GraphQL documents, not GraphQL Schema
    * The generated `.tsx` content still needs to be transpiled to `.js`

<!--https://graphql-code-generator.com/docs/getting-started/documents-field#document-scanner-->

```diff
 const config: webpack.Configuration = {
   module: {
     rules: [
+      {
+        test: /\.graphql$/,
+        use: [
+          {
+            loader: 'babel-loader',
+            options: { presets: ['@babel/preset-typescript'] },
+          },
+          {
+            loader: 'graphql-codegen-loader',
+            options: {
+              schema: path.join(__dirname, 'schema.graphql'),
+            }
+          },
+        ],
+      }
```

# Options

The loader options are the same structure of [GraphQL Codegen config](https://graphql-code-generator.com/docs/getting-started/codegen-config), except [some of properties are fixed](https://github.com/piglovesyou/react-apollo-loader/blob/master/src/index.ts#L40-L51).

# License

MIT

# TODO

- [ ] Write test
- [ ] Use `@graphql-codegen/core`, not `/cli`
- [ ] Lazy load GraphQL schema when a url is specified and not ready (SSR)
