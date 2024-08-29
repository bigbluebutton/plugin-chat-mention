

# Chat Mention Plugin

## Description

The Chat Mention Plugin serves as a demonstration of how developers can create their own custom plugins. This plugin basically implements the "mention" feature as you can see down below.

![Gif of plugin demo](./public/assets/ChatMention.gif)


## Running the Plugin

1. Start the development server:

```bash
cd $HOME/mconf-bigbluebutton-plugins/questions
npm install
npm start
```

2. Add reference to it on BigBlueButton's `settings.yml` and add the required channels:

```yaml
  plugins:
    - name: ChatMentionPlugin
      url: https://<dev-server-domain>/plugins/ChatMentionPlugin.js
```

<details>
  <summary>It may be necessary to configure a specific route in Nginx to serve the plugin under development.</summary>

  Something like this:

  ```nginx
  #questions-plugins.nginx
  location /plugins/ {
    proxy_pass http://127.0.0.1:4701/static/;                 
  }
  ```

</details>
