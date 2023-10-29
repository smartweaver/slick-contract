# Users and Posts

This CommonJS example shows the output of the state when actions are sent to the contract.

## Quickstart

1. Run the following command:

    ```
    npm install && node app.js
    ```

2. Check the console. You should see the following:

    ```text
    Function "add_user" result:
    { users: { '1337': { id: 1337, name: 'crkstz' } }, posts: [] }


    Function "add_post" result:
    {
    users: { '1337': { id: 1337, name: 'crkstz' } },
    posts: [ { title: 'Hello', body: 'Ok' } ]
    }


    Function "delete_user" result:
    { users: {}, posts: [ { title: 'Hello', body: 'Ok' } ] }
    ```

3. Take a look in the `app.js` file to see how it results in the above output.
