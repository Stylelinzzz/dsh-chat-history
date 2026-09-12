/**
 * Declarations for the browser half of dsh-chat-history.
 *
 * These types are deliberately self-contained (no imports from upstream DSH
 * packages): the DSH client package layout changes between releases (for
 * example `dsh-client-runtime` was removed in 0.1.5 and split into
 * `dsh-client-ui-chat` / `-session` / `-renderer`), and pinning an import here
 * would break consumers on every upstream restructure. The shapes below are the
 * structural contract this plugin actually reads.
 */

/** One directory row: a user message's chat node key and its short title. */
export interface TocItem {
    /** Stable chat node key (the DOM `data-chat-anchor-key` of the message row). */
    readonly key: string;
    /** Shortened single-line title derived from the message text. */
    readonly title: string;
}

/** Selector-hook shape shared by the framework-standard hooks (useSession / useChat). */
export type TocSelectorHook<Snapshot> = <Selected>(select: (snapshot: Snapshot) => Selected) => Selected;

/** One chat node as far as the directory cares (only `kind` and `data` are read). */
export interface TocChatNode {
    readonly kind: string;
    readonly data: unknown;
}

/** Ordered chat node keys plus the keyed node store they index into. */
export interface TocChatSnapshot {
    readonly order: readonly string[];
    readonly nodes: {
        get(key: string): TocChatNode | undefined;
    };
}

/** The session-snapshot slice this plugin reads; stable across DSH versions. */
export interface TocSessionSnapshot {
    /** Whether older history still exists outside the loaded window. */
    readonly hasMore: boolean;
    /** Whether an older-page request is in flight. */
    readonly loadingOlder: boolean;
    /**
     * Pre-0.1.5 home of the chat nodes. DSH 0.1.5 moved these to the `useChat`
     * standard hook, so this is only populated on older profiles.
     */
    readonly chat?: TocChatSnapshot;
}

/** Props injected into the directory panel by the renderer host. */
export interface TocPanelProps {
    /** Session-scope standard hook: select from the session snapshot. */
    useSession: TocSelectorHook<TocSessionSnapshot>;
    /**
     * Chat-node standard hook. Present on DSH >= 0.1.5 (provided by
     * `dsh-client-ui-chat`); its absence selects the legacy `useSession` path.
     */
    useChat?: TocSelectorHook<TocChatSnapshot>;
    /**
     * Official cross-view switch on DSH >= 0.1.5. Older profiles fall back to
     * clicking the Chat tab button.
     * @param view - target view id ("chat").
     * @param focus - optional focus payload forwarded to that view.
     */
    openView?: (view: string, focus?: unknown) => void;
    /** Pull one older history page (the session guards re-entry). */
    loadOlderPage: () => Promise<void>;
    /** Locale-bound translator for this plugin's namespace. */
    t: (key: string, params?: Record<string, string>) => string;
}

/** The directory panel component registered into the conversation.view slot. */
export declare function TocPanel(props: TocPanelProps): JSX.Element;
