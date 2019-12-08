# react-apollo-loader

A webpack loader to make those who use [React Apollo](https://github.com/apollographql/react-apollo#readme) and [GraphQL Code Generator](https://graphql-code-generator.com/) _happier_. You can do:

```typescript
import { useMyQuery } from './myQuery.graphql';

export defautl function(props: {}) {
  const { data, loading } = useMyQuery();
  
  return loading ? <div>loading</div> : <div>{data!.myQuery.text}</div>;
}
```

# Restrictions

Make sure you

* like [Apollo](https://www.apollographql.com/)
* are willing to have the TypeScript types of your GraphQL response easily
* have a valid GraphQL server
* use [apollo-client](https://github.com/apollographql/apollo-client#readme) in [TypeScript](https://www.typescriptlang.org/)
* write all your GraphQL documents in `.graphql` files, instead of `.tsx` ←This's going to be the preparation for setup

# Setup

1. Add the line to your `.gitignore`
    * react-apollo-loader will generate `.d.ts` right next to your `.graphql` GraphQL document files.

```diff
+*.graphql.d.ts
```

2. Make sure you have `schema.graphql` **OR** a GraphQL Server up and running. I recommend you to have `schema.graphql`

3. Setup the GraphQL document scanner in your `webpack.config.{js,ts}`. Note: 
    * Make sure you're including only GraphQL documents, not GraphQL Schema
    * The generated `.tsx` files still needs to be transpiled to `.js`

<!--https://graphql-code-generator.com/docs/getting-started/documents-field#document-scanner-->

```typescript
const config: webpack.Configuration = {
  module: {
    rules: [
      {
        test: /\.graphql$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-typescript'],
            },
          },
          {
            loader: 'graphql-codegen-loader',
            options: {
              schema: path.join(__dirname, 'schema.graphql'),
            }
          },
```

# License

MIT

# TODO

- [ ] Write test
