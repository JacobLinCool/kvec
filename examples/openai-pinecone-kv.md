# OpenAI + Pinecone + KV

This example shows how to use the following backends together:

- Adapter: `BaseTextAdapter`: Support text, web page, and image items.
- Encoder: `OpenAIEncoder`: Use OpenAI's `text-embedding-ada-002` to create embeddings
- ObjStore: `CloudflareKVObjStore`: Use Cloudflare's KV as the object store backend
- VecStore: `PineconeVecStore`: Use Pinecone as the vector store backend
- Cache: `CloudflareCache`: Use Cloudflare's Cache API to cache the search results

## Setup

### Preparation

#### OpenAI

You can get the `OPENAI_API_KEY` from [OpenAI](https://platform.openai.com/account/api-keys). Something like `sk-xxx`.

#### Pinecone

First, create a new index at [Pinecone Console](https://app.pinecone.io/).

> The dimension of the index should be **1536** with **cosine** similarity.

Get the following 2 values from the index page:

- `PINECONE_API_KEY`: Something like `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- `PINECONE_ENDPOINT`: Something like `myindex-xxxxxxx.svc.us-central1-gcp.pinecone.io`

#### Cloudflare

Create a new KV namespace at [Cloudflare Dashboard](https://dash.cloudflare.com/).

### Setup Cloudflare Pages

1. [Fork this repo](https://github.com/JacobLinCool/kvec/fork)
2. Go to [Cloudflare Pages](https://pages.cloudflare.com/) and create a new project with the forked repo
   ![Create Project](https://i.imgur.com/rcCemdC.png)
   ![Select Repo](https://i.imgur.com/yQxwSXQ.png)
3. Set the following environment variables:
    ![Set Env Vars](https://i.imgur.com/VSNjiXu.png)
4. Deploy the project, then bind the KV namespace
    ![Bind KV](https://i.imgur.com/oZQwJFP.png)
5. Done!

> You may need to re-deploy the project after updating the environment variables or binding the KV namespace to make the changes take effect.

## Usage

You can interact with your KVec using the dashboard GUI at `https://your-project.pages.dev/`.

Or you can use the API directly. (See project [README](../README.md))
