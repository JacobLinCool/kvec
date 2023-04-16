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

- `KV`: KV namespace for storing items

## GUI

You can use the dashboard GUI to manage items and issue tokens.

You can access the dashboard from `https://kvec.yourdomain.com/`.

## API

### Authentication

You will need to get a JWT token to make requests to the item API.

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

### Item API

The item API allows you to create, read, delete, and search items.

#### Create an item

`write` permission is required.

```bash
curl -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: YOUR_TOKEN" \
    -d '{ "data": { text: "the content of the item" }, "metadata": { "$type": "text" } }' \
    https://kvec.yourdomain.com/api/item
```

```json
{
    "id": "ITEM_ID"
}
```

> This will create a new `text` item with the content `the content of the item`.
> Currently, only `text` items are supported.
> But we are planning to support more types in the future, such as `image` and `webpage`.

#### Read an item

`read` permission is required.

```bash
curl -X GET \
    -H "Content-Type: application/json" \
    -H "Authorization: YOUR_TOKEN" \
    https://kvec.yourdomain.com/api/item/<ITEM_ID>
```

```json
{
    "item": {
        "id": "ITEM_ID",
        "data": {
            "text": "the content of the item"
        },
        "metadata": {
            "$type": "text",
            "$encode": "text-embedding-ada-002"
        }
    }
}
```

#### Delete an item

`write` permission is required.

```bash
curl -X DELETE \
    -H "Content-Type: application/json" \
    -H "Authorization: YOUR_TOKEN" \
    https://kvec.yourdomain.com/api/item/<ITEM_ID>
```

```json
{
    "deleted": true,
    "item": {
        "id": "ITEM_ID",
        "data": {
            "text": "the content of the item"
        },
        "metadata": {
            "$type": "text",
            "$encode": "text-embedding-ada-002"
        }
    }
}
```

#### Search items

It performs a semantic search to find items that are similar to the query.

`read` permission is required.

```bash
curl -X GET \
    -H "Content-Type: application/json" \
    -H "Authorization: YOUR_TOKEN" \
    https://kvec.yourdomain.com/api/item?q=<QUERY>
```

```json
{
    "items": [
        {
            "id": "ITEM_ID_1",
            "data": {
                "text": "the content of item 1"
            },
            "metadata": {
                "$type": "text",
                "$encode": "text-embedding-ada-002"
            }
        },
        {
            "id": "ITEM_ID_2",
            "data": {
                "text": "the content of item 2"
            },
            "metadata": {
                "$type": "text",
                "$encode": "text-embedding-ada-002"
            }
        }
    ]
}
```

## Methology

### Storing Strategies

- Source of Truth: The ItemStore is the source of truth for the data.
