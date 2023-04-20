# Adapter

## BaseTextAdapter

Always enabled because it's the default adapter.

Support the following item shapes:

```json
{
    "data": {
        "text": "Text Item."
    }
}
```

```json
{
    "data": {
        "page": "https://web-page.com/some/page"
    }
}
```

```json
{
    "data": {
        "img": "https://my.image.com/some/image.png"
    }
}
```

Configurable through environment variables:

- `HF_API_TOKEN`: To enable image item support. It uses Hugging Face's inference API to transform the image into text.
- `HF_IMGCAP_MODEL`: To change the image captioning model. The default model is `nlpconnect/vit-gpt2-image-captioning`.
