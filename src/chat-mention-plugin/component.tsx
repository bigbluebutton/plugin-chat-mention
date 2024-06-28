import * as React from 'react';
import { useState, useEffect } from 'react';

import { BbbPluginSdk, PluginApi } from 'bigbluebutton-html-plugin-sdk';
import { ChatMentionProps } from './types';

const REGEX = /@\S*(?:\s{0,2}\S+)?/;

function ChatMention(
  { pluginUuid: uuid }: ChatMentionProps,
): React.ReactElement {
  BbbPluginSdk.initialize(uuid);
  const pluginApi: PluginApi = BbbPluginSdk.getPluginApi(uuid);

  const [chatIdsToApplyHighlights, setChatIdsToApplyHighlights] = useState<string[]>([]);
  const response = pluginApi.useLoadedChatMessages();
  const userListBasicInf = pluginApi.useUsersBasicInfo();
  const currentUser = pluginApi.useCurrentUser();

  useEffect(() => {
    if (response.data && userListBasicInf.data) {
      const userNames = userListBasicInf.data.user.map((user) => user.name);

      const idsToApply = response.data.filter((message) => {
        const mentionMatch = message.message.match(REGEX);
        if (mentionMatch) {
          const mentionedName = mentionMatch[0].slice(1);
          return userNames.includes(mentionedName);
        }
        return false;
      }).map((message) => message.messageId);

      setChatIdsToApplyHighlights(idsToApply);
    }
  }, [response, userListBasicInf]);

  const chatMessagesDomElements = pluginApi.useChatMessageDomElements(chatIdsToApplyHighlights);

  chatMessagesDomElements?.forEach((chatMessageDomElement) => {
    const mention = chatMessageDomElement.innerText.match(REGEX);
    if (mention) {
      const mentionedName = mention[0].slice(1);
      let style = 'color: #4185cf; background-color: #f2f6f8;';
      if (mentionedName === currentUser.data.name) {
        style = 'color: #ff0000; background-color: #f2f6f8;';
      }
      // eslint-disable-next-line no-param-reassign
      chatMessageDomElement.innerHTML = chatMessageDomElement.innerHTML.replace(mention[0], `<span style="${style}">${mention[0]}</span>`);
    }
  });
  return null;
}

export default ChatMention;
