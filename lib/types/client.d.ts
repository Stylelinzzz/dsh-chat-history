import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-ui-slots';
import type { ConversationSnapshot } from '@deepseek-ai/dsh-client-runtime/client';

/** One directory row: a user message's chat node key and its short title. */
export interface TocItem {
    /** Stable chat node key (the DOM `data-chat-anchor-key` of the message row). */
    readonly key: string;
    /** Shortened single-line title derived from the message text. */
    readonly title: string;
}

/** Props injected by the framework into the TOC panel component. */
export interface TocPanelProps {
    /** Session-scope standard hook: select from the conversation snapshot. */
    useSession: SnapshotSelectorHook<ConversationSnapshot>;
    /** Pull one older history page; resolves true when new nodes landed. */
    loadOlderPage: () => Promise<boolean>;
}

/** The TOC panel component registered into the conversation.view slot. */
export declare function TocPanel(props: TocPanelProps): JSX.Element;
