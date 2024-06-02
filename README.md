
Diana: An observation bot to identify Discord messages that should trigger events too complex to handle in a singular bot project.

Set the following environment variables:

- `BOT_TOKEN`: Discord bot token
- `GATEWAY_TOKEN`: (Optional) A token provided under the `Authorization` header for event forwarding requests
- `GATEWAY_URL`: A URL where all events will be sent to
- `MATCH_PATTERN`: A pattern that will be passed into a `RegExp` object. Any messages that return a match with this pattern will trigger an event.
