# Desmos Golf Site

The source code for the Desmos Code Golf Site (both server and client).

## Setup

You will probably need to build both the server and the client.

### Server

```sh
cd server
npm i
npm run dev
# close after compiling or open new terminal
npm start
```

You'll likely have to create a `secret.txt` file in the `server` directory. This is essentially an admin password that gives you write access to the challenge list so you can easily create new challenges. It should go without saying, but don't reuse an existing password for this, because it's both stored and transmitted in plaintext (though it's theoretically secure over HTTPS).

### Client

```sh
cd client/sandbox
npm i
npm run build
```
