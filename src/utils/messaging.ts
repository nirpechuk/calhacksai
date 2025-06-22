import { defineExtensionMessaging, GetDataType } from '@webext-core/messaging';
import { defineWindowMessaging } from '@webext-core/messaging/page';



interface ProtocolMap {
    // TODO: add api schema here
    activate(dom: string): void;
    highlight(selector: string): void;
}

// NOTE: this is to send messages between the background script and the content script
export const extensionMessenger = defineExtensionMessaging<ProtocolMap>();

// NOTE: this is to send messages between the injected script and the content script
export const websiteMessenger = defineWindowMessaging<ProtocolMap>({
    namespace: 'website-messenger',
});