import * as React from 'react';
import { useState, useEffect } from 'react';
import { BbbPluginSdk, PluginApi } from 'bigbluebutton-html-plugin-sdk';
import { ChatMentionProps } from './types';

const REGEX = /@[^\s\n]+(?: [^\s\n]+)?/g;

function ChatMention({ pluginUuid: uuid }: ChatMentionProps): React.ReactElement {
  BbbPluginSdk.initialize(uuid);
  const pluginApi: PluginApi = BbbPluginSdk.getPluginApi(uuid);

  const [chatIdsToApplyHighlights, setChatIdsToApplyHighlights] = useState<string[]>([]);
  const response = pluginApi.useLoadedChatMessages();
  const userListBasicInf = pluginApi.useUsersBasicInfo();

  useEffect(() => {
    if (response.data && userListBasicInf.data) {
      const userNames = userListBasicInf.data.user.map((user) => user.name);

      const idsToApply = response.data.filter((message) => {
        const mentions = message.message.match(REGEX);
        if (mentions) {
          const mentionedNames = mentions.map((mention) => mention.slice(1));
          return mentionedNames.some((name) => userNames.includes(name));
        }
        return false;
      }).map((message) => message.messageId);

      setChatIdsToApplyHighlights(idsToApply);
    }
  }, [response, userListBasicInf]);

  const chatMessagesDomElements = pluginApi.useChatMessageDomElements(chatIdsToApplyHighlights);

  useEffect(() => {
    chatMessagesDomElements?.forEach((chatMessageDomElement) => {
      const parentElement = chatMessageDomElement.parentElement;
      
      if (parentElement?.getAttribute('already-styled') === 'true') return;

      parentElement?.setAttribute('already-styled', 'true');
      
      let updatedHtml = chatMessageDomElement.innerHTML;
      const mentions = chatMessageDomElement.innerText.match(REGEX);

      if (mentions) {
        const style = 'color: #4185cf; background-color: #f2f6f8;';
        mentions.forEach((mention) => {
          const mentionText = mention;
          updatedHtml = updatedHtml.replace(mentionText, `<span style="${style}">${mentionText}</span>`);
        });
        chatMessageDomElement.innerHTML = updatedHtml;
      }
    });
  }, [chatMessagesDomElements]);

  return null;
}

export default ChatMention;
