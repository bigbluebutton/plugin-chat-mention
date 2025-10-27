import * as React from 'react';
import { useState, useEffect } from 'react';
import { BbbPluginSdk, PluginApi } from 'bigbluebutton-html-plugin-sdk';
import { ChatMentionProps } from './types';

const REGEX = /@[^\n@]+/g;

function ChatMention({ pluginUuid: uuid }: ChatMentionProps): React.ReactElement {
  BbbPluginSdk.initialize(uuid);
  const pluginApi: PluginApi = BbbPluginSdk.getPluginApi(uuid);

  const [chatIdsToApplyHighlights, setChatIdsToApplyHighlights] = useState<string[]>([]);
  const response = pluginApi.useLoadedChatMessages();
  const userListBasicInf = pluginApi.useUsersBasicInfo();

  useEffect(() => {
    if (response.data && userListBasicInf.data) {
      const userNames = userListBasicInf.data.user
        .map((user) => user.name)
        .sort((a, b) => b.length - a.length);

      const idsToApply = response.data.filter((message) => {
        const mentions = message.message.match(REGEX);

        if (mentions) {
          const mentionMatchesUser = mentions.some(
            (mention) => userNames.some((name) => {
              const userNameRegex = new RegExp(`@${name}\\b`, 'i');
              return userNameRegex.test(mention.trim());
            }),
          );
          return mentionMatchesUser;
        }
        return false;
      }).map((message) => message.messageId);

      setChatIdsToApplyHighlights(idsToApply);
    }
  }, [response, userListBasicInf]);

  const chatMessagesDomElements = pluginApi.useChatMessageDomElements(chatIdsToApplyHighlights);

  useEffect(() => {
    chatMessagesDomElements?.forEach((domElement) => {
      const chatMessageDomElement = domElement;
      const { parentElement } = chatMessageDomElement;

      if (parentElement?.getAttribute('already-styled') === 'true') return;

      parentElement?.setAttribute('already-styled', 'true');

      let updatedHtml = chatMessageDomElement.innerHTML;
      const mentions = chatMessageDomElement.innerText.match(REGEX);

      if (mentions) {
        const style = 'color: #4185cf; background-color: #f2f6f8;';

        mentions.forEach(() => {
          userListBasicInf.data.user
            .sort((a, b) => b.name.length - a.name.length)
            .forEach((user) => {
              const userNameRegex = new RegExp(`@${user.name}\\b`, 'gi');
              const mentionText = `@${user.name}`;
              updatedHtml = updatedHtml.replace(userNameRegex, `<span style="${style}">${mentionText}</span>`);
            });
        });

        chatMessageDomElement.innerHTML = updatedHtml;
      }
    });
  }, [chatMessagesDomElements, userListBasicInf]);

  return null;
}

export default ChatMention;
