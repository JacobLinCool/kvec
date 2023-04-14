# KVec

Use Cloudflare KV with OpenAI Text Embedding and Pinecone Vector Database.

![icon](static/icon.png)

## Setup

You will need to set up a [Cloudflare Pages](https://pages.cloudflare.com/) project first.

### Requirements

You should set up the following environment variables:

- `PINECONE_API_KEY`: API access key for Pinecone
- `PINECONE_ENDPOINT`: The endpoint of your Pinecone index
- `OPENAI_API_KEY`: API access key for OpenAI
- `APP_SECRET`: Secret for signing JWT tokens

And bind a KV namespace:

- `KV`: KV namespace for storing documents

## GUI

You can use the dashboard GUI to manage documents and issue tokens.

You can access the dashboard from `https://kvec.yourdomain.com/`.

## API

### Authentication

You will need to get a JWT token to make requests to the document API.

One way to do this is to use the dashboard GUI.

However, you can also issue tokens using the API itself:

```bash
curl -X POST \
    -H "Content-Type: application/json" \
    -d '{ "secret": "your-app-secret", "exp": 3600, "perm": { "read": true, "write": false } }' \
    https://kvec.yourdomain.com/api/auth
# Creates a token that expires in 1 hour and only allows read access
```

```json
{
    "token": "ISSUED_JWT"
}
```

> The token can be passed in the `Authorization` header of the request or the `kvec_token` cookie.

### Document API

The document API allows you to create, read, delete, and search documents.

#### Create a document

`write` permission is required.

```bash
curl -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: YOUR_TOKEN" \
    -d '{ "content": "the content of the document" }' \
    https://kvec.yourdomain.com/api/doc
```

```json
{
    "id": "DOCUMENT_ID"
}
```

#### Read a document

`read` permission is required.

```bash
curl -X GET \
    -H "Content-Type: application/json" \
    -H "Authorization: YOUR_TOKEN" \
    https://kvec.yourdomain.com/api/doc/<DOCUMENT_ID>
```

```json
{
    "doc": {
        "id": "DOCUMENT_ID",
        "content": "the content of the document",
        "on": 1681467661006
    }
}
```

#### Delete a document

`write` permission is required.

```bash
curl -X DELETE \
    -H "Content-Type: application/json" \
    -H "Authorization: YOUR_TOKEN" \
    https://kvec.yourdomain.com/api/doc/<DOCUMENT_ID>
```

```json
{
    "deleted": true,
    "doc": {
        "id": "DOCUMENT_ID",
        "content": "the content of the document",
        "on": 1681467661006
    }
}
```

#### Search documents

It performs a semantic search to find documents that are similar to the query.

`read` permission is required.

```bash
curl -X GET \
    -H "Content-Type: application/json" \
    -H "Authorization: YOUR_TOKEN" \
    https://kvec.yourdomain.com/api/doc?q=<QUERY>
```

```json
{
    "docs": [
        {
            "id": "DOCUMENT_ID_1",
            "content": "the content of the document 1",
            "on": 1681467661006
        },
        {
            "id": "DOCUMENT_ID_2",
            "content": "the content of the document 2",
            "on": 1681467661006
        }
    ]
}
```
